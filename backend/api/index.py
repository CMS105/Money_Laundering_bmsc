"""
Vercel Serverless Entrypoint for FastAPI
Exports the ASGI `app` object.
"""
import sys
from pathlib import Path

# Ensure the backend/api package directory is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

try:
    from .main import app
except ImportError:
    from main import app

