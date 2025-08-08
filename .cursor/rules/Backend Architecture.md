# Backend Architecture

---

## Backend Plan: Dental AI Patient Engagement Platform

### 1. Technology Stack

- **Language:** Python 3.10+
- Engine: uvicorn
- **Web Framework:** FastAPI
- **Database:** MongoDB
- **Asynchronous Driver:** Motor
- **Scheduler:** APScheduler
- **Data Validation:** Pydantic
- **LLM & RAG Integration:** Custom-built services using libraries langGraph, and openai  for LLM access.

### 2. API Endpoints

The backend will be built with FastAPI and will expose the following versioned endpoints (/api/v1):

### 1. Authentication Endpoints

These endpoints manage access for clinic staff to the admin dashboard.

| Endpoint | POST /auth/login |
| --- | --- |
| **Explanation** | Authenticates a staff member using their registered email and password. On success, it returns a short-lived JSON Web Token (JWT) that must be included in the header of all subsequent authenticated requests. |
| **Request Body** | {"email": "[sarah.chen@dentalclinic.com](https://www.google.com/url?sa=E&q=mailto%3Asarah.chen%40dentalclinic.com)", "password": "a_strong_password"} |
| **Example Response** | {"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "token_type": "bearer"} |

| Endpoint | GET /users/me |
| --- | --- |
| **Explanation** | Fetches the profile of the currently logged-in staff member, identified by the JWT in the Authorization header. This is useful for displaying the user's name or role in the UI. |
| **Request Body** | None. |
| **Example Response** | {"user_id": "67d4...", "name": "Sarah Chen", "email": "[sarah.chen@dentalclinic.com](https://www.google.com/url?sa=E&q=mailto%3Asarah.chen%40dentalclinic.com)", "role": "Office Manager"} |

---

### 2. Public & Booking Endpoints

These endpoints are called by the custom booking website and do not require authentication.

| Endpoint | GET /availability |
| --- | --- |
| **Explanation** | Fetches all available appointment slots for a given time period. The backend calculates this by checking provider schedules (users collection) against already booked slots (appointments collection). |
| **Request Body** | None. Uses Query Parameters: ?month=8&year=2025&service_id=teeth_whitening |
| **Example Response** | {"2025-08-20": ["09:00", "10:00", "14:00"], "2025-08-21": ["09:00", "11:00"]} |

| Endpoint | POST /appointments/book |
| --- | --- |
| **Explanation** | The final conversion step. The booking website calls this endpoint when a user selects a time slot and submits the form. It creates the appointment and marks the corresponding AI campaign as successful. |
| **Request Body** | json { “name”: “…", “email”: “…”, “phone”: “…”, ”appointment_date": "2025-08-20T14:00:00Z",  "service_name": "Teeth Whitening" } |
| **Example Response** | {"message": "Appointment booked successfully.", "appointment_id": "68f100000000000000000001"} |

---

### 3. Webhook Endpoint

This is a system-to-system endpoint used for real-time event notifications.

| Endpoint | POST /webhooks/gmail |
| --- | --- |
| **Explanation** | The dedicated endpoint that receives push notifications from Google when a patient replies to an email. The backend's job is to immediately acknowledge the request with a 200 OK and then trigger a background task to process the new message, ensuring no delays. |
| **Request Body** | A Google-defined JSON payload: {"message": {"data": "base64_encoded_string", "messageId": "...", ...}, "subscription": "..."} |
| **Example Response** | An empty 200 OK status. |

---

### 4. Admin Dashboard Endpoints

These endpoints power the entire administrative interface and require a valid JWT.

### 4.1 Dashboard & Analytics

| Endpoint | GET /admin/dashboard-stats |
| --- | --- |
| **Explanation** | Retrieves all the necessary KPIs to render the main dashboard in a single, efficient API call. |
| **Request Body** | None. |
| **Example Response** | json { "kpis": { "appointments_booked_month": 12, "handoffs_requiring_action": 3, "active_recovery_campaigns": 45 }, "conversion_rates": { "recovery_rate_percent": 5.0, "recall_rate_percent": 85.0 } } |

### 4.2 Campaign Management

| Endpoint | GET /admin/campaigns |
| --- | --- |
| **Explanation** | Fetches a paginated list of campaigns for the main management table. Supports powerful filtering via query parameters. |
| **Request Body** | None. Uses Query Parameters: ?status=HANDOFF_REQUIRED&page=1&limit=25 |
| **Example Response** | json { "pagination": { "total_items": 3, "total_pages": 1, "current_page": 1 }, "campaigns": [ { "campaign_id": "...", "patient_name": "John Doe", "campaign_type": "RECOVERY", "status": "HANDOFF_REQUIRED", "last_updated": "..." } ] } |

| Endpoint | POST /admin/campaigns/recovery |
| --- | --- |
| **Explanation** | Manually creates a new cold lead recovery campaign. This involves creating a patients document and a campaigns document. |
| **Request Body** | json { "patient_name": "New Lead", "patient_email": "[new.lead@email.com](https://www.google.com/url?sa=E&q=mailto%3Anew.lead%40email.com)", "initial_inquiry": "Was interested in crowns.", "estimated_value": 1200 } |
| **Example Response** | {"message": "Recovery campaign created successfully.", "campaign_id": "..."} |

| Endpoint | GET /admin/campaigns/{campaign_id} |
| --- | --- |
| **Explanation** | Retrieves the complete details for one specific campaign, including its full conversation history. This is used for the "deep dive" view when handling a handoff. |
| **Request Body** | None. |
| **Example Response** | json { "campaign_details": { "campaign_id": "...", "patient_name": "John Doe", "status": "HANDOFF_REQUIRED", "engagement_summary": "Patient asking complex insurance questions." }, "conversation_history": [ { "direction": "outgoing", "content": "Hi John...", "timestamp": "..." }, { "direction": "incoming", "content": "Actually, my insurance is complicated...", "timestamp": "..." } ] } |

| Endpoint | POST /admin/campaigns/{campaign_id}/respond |
| --- | --- |
| **Explanation** | Allows a staff member to send a direct reply during a handoff, effectively taking over the conversation from the AI. |
| **Request Body** | json { "message": "Hi John, this is Sarah from the front desk. I can help with your insurance question...", "new_status": "RE_ENGAGED" } |
| **Example Response** | {"message": "Response sent successfully."} |

### 4.3 Appointment & Schedule Management

| Endpoint | GET /admin/appointments |
| --- | --- |
| **Explanation** | Fetches a list of appointments for a given date range to display on a clinic calendar or daily schedule view. |
| **Request Body** | None. Uses Query Parameters: ?start_date=2025-08-01&end_date=2025-08-31&provider_id=... |
| **Example Response** | json { "appointments": [ { "appointment_id": "...", "patient_name": "Maria Garcia", "appointment_date": "...", "service_name": "Annual Cleaning", "status": "CONFIRMED" } ] } |

| Endpoint | POST /admin/appointments |
| --- | --- |
| **Explanation** | Allows a staff member to manually book an appointment that did not originate from an AI campaign (e.g., a patient calls on the phone). |
| **Request Body** | json { "appointment_date": "2025-09-05T11:00:00Z", "duration_minutes": 45, “name” : “alice”, “email”: “abc#@gmail.com”, “preferred_channel” : “whatsapp” ,"service_name": "Annual Cleaning", "notes": "Patient called to schedule." } |
| **Example Response** | The full, newly created appointment object. |
|  |  |

### 5. Interaction Endpoints

These endpoints are used to retrieve the conversational history of a campaign.

| **Endpoint** | **GET /admin/interactions/{campaign_id}** |
| --- | --- |
| **Explanation** | Fetches the complete, chronological list of interactions (both incoming and outgoing messages) for a specific campaign. This is essential for the "deep dive" view in the admin dashboard, allowing staff to review the entire conversation history when a handoff occurs. |
| **Request Body** | None. |
| **Example Response** | {"interactions": [ { "_id": "...", "campaign_id": "...", "direction": "outgoing", "content": "Hi John, are you still interested in crowns?", "ai_analysis": {"intent": "GREETING", "sentiment": "NEUTRAL"}, "timestamp": "..." }, { "_id": "...", "campaign_id": "...", "direction": "incoming", "content": "Yes, but my insurance is complicated.", "ai_analysis": {"intent": "QUESTION", "sentiment": "NEUTRAL"}, "timestamp": "..." } ]} |

| **Endpoint** | **POST /admin/interactions** |
| --- | --- |
| **Explanation** | Manually creates a new interaction record. This is primarily for internal, testing, or debugging purposes, as most interactions are created automatically by the webhook and AI agent workflows in response to real patient communication. It requires a valid JWT. |
| **Request Body** | json { "campaign_id": "...", "direction": "outgoing", "content": "This is a test message.", "ai_analysis": { "intent": "TEST", "sentiment": "NEUTRAL" } } |
| **Example Response** | {"message": "Interaction created successfully.", "interaction_id": "..."} |

### 3. Database Schemas (MongoDB)

**Collection: “**patients” *****The master source of truth for every individual*

```json
{
  "_id": ObjectId(),
  "name": "String",
  "email": "String",
  "phone": "String",
  "patient_type": "Enum: ['EXISTING', 'COLD_LEAD']",
  "preferred_channel": ["Enum: ['email', 'whatsapp', 'sms']"],
  "treatment_history": [{
    "procedure_name": "String",
    "procedure_date": "ISODate",
    "next_recommended_follow_up": "String",
    "next_follow_up_date": "ISODate"
  }],
  "created_at": "ISODate",
  "updated_at": "ISODate"
}

```

**Collection: “**campaigns” *every individual outreach effort.*

```json
{
  "_id": ObjectId(),
  "patient_id": "ObjectId", // Links to patients collection
  "campaign_type": "Enum: ['RECALL', 'RECOVERY']",
  "status": "Enum: ['ATTEMPTING_RECOVERY', 'RE_ENGAGED', 'HANDOFF_REQUIRED', 'RECOVERED', 'RECOVERY_FAILED', 'BOOKING_INITIATED', 'RECOVERY_DECLINED',BOOKING_COMPLETED]",
  "channel": {
    "type": "Enum: ['email', 'whatsapp', 'sms']",
    "thread_id": "String"
  },
  "engagement_summary": "String",
  "follow_up_details": {
    "attempts_made": "Number",
    "max_attempts": "Number",
    "next_attempt_at": "ISODate"
  },
  "booking_funnel": {
    "status":  "Enum: ['FORM_SENT', 'FORM_SUBMITTED']",
    "link_url": "String",
    "submitted_at": "ISODate"
  },
  "handoff_details": "Object",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}

```

**Collection: “**interactions”  *****The detailed, chronological history for every campaign.*codeJson

```json
{
  "_id": ObjectId(),
  "campaign_id": "ObjectId", // Links to campaigns collection
  "direction": "Enum: ['outgoing', 'incoming']",
  "content": "String",
  "ai_analysis": {
    "intent": "String",
    "sentiment": "String"
  },
  "timestamp": "ISODate"
}

```

**Collection:  “role”** *Manages the human staff for handoffs.*codeJson

```json
{
  "_id": ObjectId(),
  "name": "String",
  "email": "String",
  "role": "String"
  "hashed_password": "string",
}

```

collection: “appointment” Manages the appointment booking

```json
{
"_id": ObjectId(),
"patient_id": "ObjectId",
"campaign_id": "ObjectId",
"appointment_date": "ISODate",
"duration_minutes": "Number",
"status": "Enum: ['booked', 'completed', 'cancelled']",
"service_name": "String",
"notes": "String",
"created_from": "Enum: ['AI_AGENT_FORM', 'MANUAL_ADMIN']",
"created_at": "ISODate",
"updated_at": "ISODate"
}
```

1. endpoint business logic

**Part 1: API Endpoint Business Logic**This section describes the internal processes for each API endpoint.**1. Authentication Endpoints (***(No change in logic)*

- **`POST /auth/login`**: Validates credentials against the `users` collection and returns a JWT.
- **`GET /users/me`**: Validates the JWT and returns the profile of the logged-in user.

**2. Public & Booking Endpoints**

- **`GET /availability`**: Returns a list of available appointment slots by checking against the `appointments` collection.
- **`POST /appointments/book`**
- **Logic:** This endpoint handles a booking form submission from a patient. It does **not** mark a campaign as converted.
1. The server receives patient contact info (`name`, `email`, `phone`) and appointment details in the request body.
2. **Step 1: Identify the Patient & Campaign (Internal Lookup):**
3. a. It queries the `patients` collection using the provided `email` **OR** `phone` to find a matching document and retrieve the `patient_id`.
4. b. If no patient is found, a `404 Not Found` error is returned (as this flow is only for re-engaged leads).
5. c. Using the `patient_id`, it queries the `campaigns` collection to find the most recent **active campaign** (i.e., where `status` is `'RE_ENGAGED'`) and retrieves the `campaign_id`.
6. **Step 2: Create the Appointment:**
7. a. A new document is created in the `appointments` collection.
8. b. The `status` is set to **`'booked'`**.
9. c. `created_from` is set to **`'AI_AGENT_FORM'`**.
10. d. The retrieved `patient_id` and `campaign_id` are stored within this new appointment document for future reference.
11. **Step 3: Update the Campaign Status:**
12. a. The server updates the campaign document (identified in Step 1c) by setting its `status` to **`'BOOKING_INITIATED'`**. This signifies the patient has completed the booking action.
13. A success message and the new `appointment_id` are returned.

**3. Webhook Endpoints (**

- **`POST /webhooks/gmail`**
- **Explanation:** This is the dedicated endpoint for Google Pub/Sub notifications for incoming emails.
- **Logic:**
1. The server receives the Google Pub/Sub JSON payload. It immediately responds with a `200 OK`.
2. It triggers a background job to process the notification.
3. **Background Job Logic:**
4. a. Decode the Base64 `message.data` string from the payload to get the email history ID.
5. b. Use the Gmail API (with pre-authorized credentials) to fetch the full email thread using the history ID.
6. c. Extract the key information: the sender (`From`), the message content (body), and the `thread_id`.
7. d. Find the corresponding campaign in the `campaigns` collection by matching `channel.thread_id`.
8. e. Pass the extracted `message_content` and the found `campaign` object to the **AI Agent's Reactive Workflow**.
- **`POST /webhooks/incoming-message`**
- **Explanation:** A generic endpoint for other channels like WhatsApp or SMS.
- **Logic:** Similar to the Gmail webhook, it immediately acknowledges the request and passes the standardized payload (`channel`, `thread_id`, `message_content`) to a background job that triggers the **AI Agent's Reactive Workflow**.

**4. Admin Dashboard Endpoints (**

- **`GET /admin/dashboard-stats`**:
- **Logic:** Performs aggregation queries. **Crucially**, all conversion-based metrics (`Recoveries`, `Recovery Rate`, `Recall Rate`, `Pipeline Value Recovered`) are calculated based on campaigns
- **&** : Standard read operations to populate the Handoff Queue UI.
- **`PATCH /admin/campaigns/{campaign_id}/status`**: Updates a campaign's status, primarily used to clear a task from the Handoff Queue by setting `status` to `'MANUAL_FOLLOWUP_COMPLETE'`.
- **`POST /admin/appointments`**: Manually creates an appointment, first checking if the patient exists or creating a new one. `created_from` is set to `'MANUAL_ADMIN'`.
- **`POST /admin/appointments/{appointment_id}/complete`**
- **Explanation:** This is the **primary conversion endpoint**. It marks an appointment as completed and handles the logic for conversion and future recall.
- **Logic:**
1. The server finds the appointment by its `_id`.
2. **Step 1: Update Appointment Status:** It updates the `appointments` document, setting its `status` to **`'completed'`**.
3. **Step 2: Update Campaign Status (Conversion):**
4. a. It retrieves the `campaign_id` stored within the appointment document.
5. b. If a `campaign_id` exists, it updates the corresponding `campaigns` document, setting its `status` to **`'RECOVERED'`**. This officially marks the campaign as successful.
6. **Step 3: Handle Future Recall (Optional):**
7. a. The request body can optionally contain a `next_follow_up_date`.
8. b. If this date is provided, the server retrieves the `patient_id` from the appointment document.
9. c. It then updates the corresponding `patients` document, setting the `next_follow_up_date` field. This action makes the patient eligible for a future **RECALL** campaign triggered by the cron job.
- **`DELETE /admin/appointments/{appointment_id}`**: Deletes an appointment document from the `appointments` collection.

**Part 2: Internal AI Agent Business Logic** section describes the automated workflows of the AI agent.**A. Triggers**

- **Proactive Trigger (Cron Job)**
- **Logic:** Runs daily.
1. **Recovery:** Finds `COLD_LEAD` patients without active campaigns.
2. **Recall:** Finds `EXISTING` patients where `next_follow_up_date` is today.
3. For each, it creates a new `campaigns` document with `status: 'ATTEMPTING_RECOVERY'`, `campaign_type: 'RECOVERY'` or `'RECALL'`, and triggers the **Proactive Path**.
- **Reactive Trigger (Webhook)**
- **Logic:** Finds the campaign via `thread_id`, creates a new `interactions` document, and triggers the **Reactive Path**.

**B. Agent Workflow & Database Logic**

- **Proactive Path (Scheduled Follow-up)**
- **Step 1: Check Retries:** Loads campaign, compares `attempts_made` to `max_attempts`.
- **Step 2 (Retries Not Reached):**
- **Action:** Generates and sends a follow-up message.
- **DB Logic:** In the `campaigns` doc, increments `attempts_made` and sets `next_attempt_at`. Creates a new `outgoing` `interactions` doc.
- **Step 3 (Retries Reached):**
- **Action:** No message is sent.
- **DB Logic:** Updates the `campaigns` doc `status` to **`'RECOVERY_FAILED'`**.
- **Reactive Path (Response to Patient Message)**
- **Step 1: Acknowledge Engagement:**
- **DB Logic:** Immediately updates the `campaigns` doc `status` to **`'RE_ENGAGED'`**.
- **Step 2: Classify Intent & Execute:**
- **Intent: Booking Request:**
- **Action:** Generates and sends a message containing the booking website URL.
- **DB Logic:** Updates the `campaigns.booking_funnel` with `status: 'FORM_SENT'`.
- **Intent: Service Denial:**
- **Action:** Sends a polite closing message.
- **DB Logic:** Updates the `campaigns` doc `status` to **`'RECOVERY_DECLINED'`**.
- **Intent: Question (Info Found):**
- **Action:** Generates an answer from the knowledge base and appends the booking URL. Sends the message.
- **DB Logic:** Creates a new `outgoing` `interactions` doc.
- **Intent: Question (Info Not Found) / Irrelevant / Confused (Human Handoff):**
- **Action:** Generates a conversation summary. Sends a message to the patient informing them of the handoff.
- **DB Logic:** Updates the `campaigns` doc `status` to **`'HANDOFF_REQUIRED'`** and populates `handoff_details` with the AI summary.
1. AI agent workflow (mermaid)

graph TD
subgraph Triggers
A[Reactive: Patient Replies - Webhook]
B[Proactive: Scheduled Check - Cron Job]
end

```
subgraph Agent Workflow
    C{Load Lead State & History from DB}
    D{Router: Analyze State & Intent}

    subgraph Proactive Path
        E[Is it time for a follow-up?] -->|Yes| F{Check Max Retries}
        F -->|Retries Not Reached| G[Generate Follow-up Email]
        F -->|Retries Reached| H[Update Status to 'RECOVERY_UNRESPONSIVE']
    end

    subgraph Reactive Path
        I[Is there a new patient reply?] -->|Yes| J{Router: Classify Patient Intent}
        J -->|Intent: Question| K[Tool: Query Knowledge Base]
        J -->|Intent: Booking Request| L[Generate Booking Link Message]
        J -->|Intent: Service Denial| M[Update Status to 'RECOVERY_DECLINED']
        J -->|Intent: Irrelevant/Confused| N[Tool: Initiate Human Handoff]
    end

    K --> O{Was Info Found?}
    O -->|Yes| P[Generate Answer & Ask to Book]
    O -->|No| N

    subgraph Final Actions
        Q[Send Email to Patient]
        R[Update Lead Record in DB]
        S[End Process]
    end
end

A --> C
B --> C
C --> D
D --> E
D --> I

G --> Q
H --> R
L --> Q
M --> Q
N --> Q
P --> Q

Q --> R
R --> S

```

![Untitled diagram _ Mermaid Chart-2025-08-07-101302.png](Backend%20Architecture%20248ac5f1d3768073a4ccedd26860d412/Untitled_diagram___Mermaid_Chart-2025-08-07-101302.png)