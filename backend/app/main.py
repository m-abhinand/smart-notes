from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, notes, ai

app = FastAPI()

# In development allow the frontend origin(s) — adjust as needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["http://localhost:3000"] or ["*"] for permissive dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(ai.router)
