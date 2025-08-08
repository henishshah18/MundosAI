### `TODO.md`

# Backend Development Plan: Dental AI Patient Engagement Platform

This document outlines the milestones and tasks required to build the backend application as specified in the `Backend Architecture.md`. Each task should be executed in order, adhering to the coding standards defined in `cursorrules.md`.

---

## Milestone 1: Project Foundation & Core Services Setup

**Goal:** Establish the foundational structure of the FastAPI application, configure the environment, set up the database connection, and define all data models.

-   [x] **Project Scaffolding:**
    -   [x] Create the main project directory.
    -   [x] Set up a virtual environment (`python -m venv venv`).
    -   [x] Initialize a `requirements.txt` file with `fastapi`, `uvicorn[standard]`, `motor`, `pydantic[email]`, `pydantic-settings`, `python-dotenv`, `passlib[bcrypt]`, `python-jose[cryptography]`, `apscheduler`, `python-json-logger`, and `httpx`.
    -   [x] Install all dependencies.
    -   [x] Create the application directory structure:
        ```
        /
        |-- app/
        |   |-- __init__.py
        |   |-- main.py
        |   |-- core/
        |   |   |-- __init__.py
        |   |   |-- config.py       # For environment variables
        |   |-- db/
        |   |   |-- __init__.py
        |   |   |-- database.py     # For MongoDB connection
        |   |-- models/
        |   |   |-- __init__.py
        |   |   |-- base.py         # Base model with common fields
        |   |   |-- patient.py
        |   |   |-- campaign.py
        |   |   |-- interaction.py
        |   |   |-- role.py
        |   |   |-- appointment.py
        |   |-- schemas/            # Pydantic schemas for API I/O
        |   |   |-- __init__.py
        |   |-- api/
        |   |   |-- __init__.py
        |   |   |-- v1/
        |   |   |   |-- __init__.py
        |   |   |   |-- router.py       # Main router
        |   |   |   |-- endpoints/
        |   |   |   |   |-- __init__.py
        |   |-- services/
        |   |   |-- __init__.py
        |-- .env
        |-- .gitignore
        |-- cursorrules.md
        |-- TODO.md
        ```

-   [x] **Configuration:**
    -   [x] Create the `.env.example` file and add placeholders for `MONGO_URI`, `DATABASE_NAME`, `JWT_SECRET_KEY`, `JWT_ALGORITHM`, and `ACCESS_TOKEN_EXPIRE_MINUTES`.
    -   [x] Implement `app/core/config.py` to load these variables using Pydantic's `BaseSettings`.

-   [x] **Database Setup:**
    -   [x] In `app/db/database.py`, implement the MongoDB connection logic using `motor`. Create a reusable function to get the database object.

-   [x] **Pydantic Models:**
    -   [x] In `app/models/`, create Pydantic models for each collection (`patients`, `campaigns`, `interactions`, `role`, `appointment`) as defined in the "Database Schemas" section of `Backend Architecture.md`.
    -   [x] Use `ObjectId` from `bson` and create a Pydantic-compatible `ObjectId` field.
    -   [x] Use Python's `Enum` for all `Enum` fields specified in the schemas.
    -   [x] Ensure all `ISODate` fields are represented as `datetime` objects.

-   [x] **Main Application File:**
    -   [x] In `app/main.py`, create the main FastAPI app instance.
    -   [x] Include the main API router from `app/api/v1/router.py`.
    -   [x] Implement a root health check endpoint (`GET /`).
    -   [x] Configure structured logging for the application as per `cursorrules.md`.

---

## Milestone 2: Authentication & User Management

**Goal:** Implement a secure authentication system using JWT for admin dashboard access.

-   [x] **User Model & Schema:**
    -   [x] Finalize the `Role` model in `app/models/role.py`, specifically ensuring the `hashed_password` field is present.
    -   [x] Create Pydantic schemas in `app/schemas/` for user creation, user display (`/users/me`), and token data.

-   [x] **Security Service:**
    -   [x] Create a new file `app/services/security.py`.
    -   [x] Implement functions for:
        -   `create_access_token()` using `python-jose`.
        -   `verify_password()` and `get_password_hash()` using `passlib`.
        -   A dependency function `get_current_user()` that validates the JWT in the `Authorization` header and fetches the user from the database.

-   [x] **Authentication Endpoints:**
    -   [x] Create `app/api/v1/endpoints/auth.py`.
    -   [x] Implement the `POST /auth/login` endpoint. It takes an `OAuth2PasswordRequestForm`, validates credentials, and returns a JWT.
    -   [x] Implement the `GET /users/me` endpoint. It uses the `get_current_user` dependency to protect the route and return the current user's data.
    -   [x] Add a utility function to create the first admin user with a hashed password.

---

## Milestone 3: Public-Facing API & Booking Funnel

**Goal:** Build the unauthenticated endpoints required for the public booking website.

-   [x] **Public Endpoints File:**
    -   [x] Create `app/api/v1/endpoints/public.py`.

-   [x] **Implement `GET /availability`:**
    -   [x] Define the endpoint with `month`, `year`, and `service_id` query parameters.
    -   [x] Placeholder implementation pending provider schedule schema.
    -   [x] Returns data in the specified format shape.

-   [x] **Implement `POST /appointments/book`:**
    -   [x] Define the endpoint and its request body Pydantic schema as per the architecture doc.
    -   [x] Implement the business logic precisely as described.

---

## Milestone 4: Asynchronous Task Processing & Webhooks

**Goal:** Set up the system to handle real-time events from external services like Google.

-   [x] **Background Task Configuration:**
    -   [x] Use FastAPI's built-in `BackgroundTasks` for handling asynchronous jobs for the Gmail webhook.

-   [x] **Webhook Endpoint File:**
    -   [x] Create `app/api/v1/endpoints/webhooks.py`.

-   [x] **Implement `POST /webhooks/gmail`:**
    -   [x] Define the endpoint to accept the Google Pub/Sub JSON payload.
    -   [x] The endpoint immediately returns a `200 OK` response.
    -   [x] It triggers a background task, passing the payload to it.

-   [x] **Background Job Logic:**
    -   [x] Create a new service `app/services/email_processor.py`.
    -   [x] Implement the function for the background task which will:
        1.  Decode the Base64 `message.data`.
        2.  (Mock) Parse the JSON to get `thread_id` and content.
        3.  Find the corresponding campaign in the DB by matching `channel.thread_id`.
        4.  (Placeholder) Prepare for handoff to the AI Agent's Reactive Workflow.

---

## Milestone 5: Admin API - Read Operations

**Goal:** Build the `GET` endpoints that power the admin dashboard, providing all necessary data for display.

-   [x] **Admin Endpoints File:**
    -   [x] Create `app/api/v1/endpoints/admin.py`.
    -   [x] Ensure all endpoints in this file are protected by the `get_current_user` dependency created in Milestone 2.

-   [x] **Implement `GET /admin/dashboard-stats`:**
    -   [x] Return KPIs and conversion rates (placeholder aggregation logic with current data).
    -   [x] Ensure conversion metrics are based on campaigns with `status: 'RECOVERED'`.

-   [x] **Implement `GET /admin/campaigns`:**
    -   [x] Support pagination (`page`, `limit`) and filter by `status`.
    -   [x] Return data in the specified paginated format.

-   [x] **Implement `GET /admin/campaigns/{campaign_id}`:**
    -   [x] Fetch campaign details and related interactions.
    -   [x] Combine and return in detailed format.

-   [x] **Implement `GET /admin/appointments`:**
    -   [x] Implement filtering by date range (`start_date`, `end_date`).

---

## Milestone 6: Admin API - Write Operations

**Goal:** Implement the `POST`, `PATCH`, and `DELETE` endpoints that allow admin staff to manage the system.

-   [x] **Implement `POST /admin/campaigns/recovery`:**
    -   [x] Create a new patient document (`patient_type: 'COLD_LEAD'`).
    -   [x] Create a new campaign document linked to the new patient.

-   [x] **Implement `POST /admin/campaigns/{campaign_id}/respond`:**
    -   [x] Create a new `outgoing` message in the `interactions` collection.
    -   [x] Update the campaign status to the `new_status` provided in the request.

-   [x] **Implement `POST /admin/appointments`:**
    -   [x] Check if the patient exists by email; if not, create one.
    -   [x] Create the appointment document with `created_from: 'MANUAL_ADMIN'`.

-   [x] **Implement `POST /admin/appointments/{appointment_id}/complete` (Primary Conversion Logic):**
    -   [x] Update the appointment's status to `'completed'`.
    -   [x] If a `campaign_id` exists on the appointment, update the corresponding campaign's status to `'RECOVERED'`.
    -   [x] If `next_follow_up_date` is provided, update the corresponding patient document to schedule a future recall.

-   [x] **Implement `DELETE /admin/appointments/{appointment_id}`:**
    -   [x] Implement the logic to delete the specified appointment document.

---

## Milestone 7: AI Agent & Core Business Logic

**Goal:** Implement the automated AI workflows that form the core of the product.

-   [ ] **AI Service Scaffolding:**
    -   [ ] Create `app/services/ai_agent.py`.
    -   [ ] This service will house the logic for both proactive and reactive paths.
    -   [ ] Set up placeholder functions for LLM/RAG integration (e.g., `generate_response()`, `classify_intent()`).

-   [ ] **Proactive Trigger (Cron Job):**
    -   [ ] Configure `APScheduler` to run a daily job.
    -   [ ] Implement the cron job logic in `app/services/ai_agent.py`:
        1.  Find `COLD_LEAD` patients needing recovery.
        2.  Find `EXISTING` patients due for `RECALL`.
        3.  For each, create a campaign and trigger the Proactive Path.

-   [ ] **Implement Proactive Path Logic:**
    -   [ ] Check `attempts_made` vs `max_attempts`.
    -   [ ] If retries are available, generate and send a follow-up, then update the DB (`campaigns` and `interactions` collections).
    -   [ ] If retries are exhausted, update the campaign status to `'RECOVERY_FAILED'`.

-   [ ] **Implement Reactive Path Logic:**
    -   [ ] Connect this logic to the webhook background job from Milestone 4.
    -   [ ] Immediately update the campaign status to `'RE_ENGAGED'`.
    -   [ ] Implement the intent classification router:
        -   **Booking Request:** Send booking link, update campaign.
        -   **Service Denial:** Send closing message, update campaign.
        -   **Question (Info Found):** Query knowledge base (mock), send answer, update DB.
        -   **Handoff:** Generate summary, send handoff message to patient, update campaign status to `'HANDOFF_REQUIRED'`.

---

## Milestone 8: Finalization, Testing, and Deployment Prep

**Goal:** Ensure the application is robust, reliable, and ready for deployment.

-   [ ] **Unit & Integration Testing:**
    -   [ ] Set up `pytest`.
    -   [ ] Write unit tests for all services (security, email processing, AI agent).
    -   [ ] Write integration tests for every API endpoint, covering success cases, error cases (4xx), and security.

-   [ ] **Documentation:**
    -   [ ] Use FastAPI's automatic OpenAPI documentation and ensure all models and endpoints have clear descriptions.
    -   [ ] Create a `README.md` with setup and run instructions.
