Mundos AI Backend (FastAPI)

Prerequisites
- Python 3.12
- MongoDB (for real DB usage; tests use in-memory fakes)

Setup
```
python3.12 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and update values as needed.

Run
```
uvicorn app.main:app --reload
```
Open API docs at: http://localhost:8000/docs

Tests
The repository includes milestone tests. You can run them individually:
```
python milestone1_test.py
python milestone2_test.py
python milestone3_test.py
python milestone4_test.py
python milestone5_test.py
python milestone6_test.py
```
Or use pytest:
```
pytest -q
```

Structure
- app/main.py – FastAPI app and logging
- app/core/config.py – Configuration (Pydantic Settings)
- app/db/database.py – Motor client and DB getter
- app/models/* – Pydantic models
- app/api/v1/endpoints/* – Versioned API endpoints
- app/services/* – Services (security, email processor)
- app/schemas/* – Request/response schemas

Notes
- Security endpoints use JWT (python-jose).
- Admin endpoints are protected via get_current_user.
- Tests use in-memory fakes and patching to avoid external services.

