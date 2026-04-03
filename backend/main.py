"""
CodeManthan Backend — FastAPI server for PDF quiz generation.
"""
import os
from dotenv import load_dotenv

load_dotenv()  # Load .env before anything else

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.quiz import router as quiz_router

app = FastAPI(
    title="CodeManthan API",
    description="Backend API for PDF-to-Quiz generation",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz_router)


@app.get("/")
async def root():
    return {"status": "ok", "service": "CodeManthan API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
