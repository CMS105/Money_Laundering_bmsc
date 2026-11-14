"""
GraphSleuth-AML One-Click Unified Server
Starts the FastAPI backend and serves the interactive React Flow visualizer.
"""
import uvicorn

if __name__ == "__main__":
    print("=================================================================")
    print(" 🚀 Launching GraphSleuth-AML Platform")
    print(" UI + REST API: http://localhost:8000")
    print(" API Docs:      http://localhost:8000/docs")
    print("=================================================================")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)

