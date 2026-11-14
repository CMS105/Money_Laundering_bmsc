"""
LaunderyLens - One-Click Launcher
Starts the FastAPI Graph Engine on http://127.0.0.1:8000 and the Next.js Dashboard on http://localhost:3000.
"""
import sys
import time
import subprocess
import webbrowser
from pathlib import Path

def main():
    root_dir = Path(__file__).resolve().parent
    frontend_dir = root_dir / "frontend"

    print("=" * 65)
    print(" 🚀 Launching LaunderyLens Platform")
    print(" Temporal Graph Engine, Hybrid ML Pipeline & SQLite Active")
    print("=" * 65)
    print(" 🌐 Interactive AML Dashboard: http://localhost:3000")
    print(" ⚡ REST API & Engine Docs:    http://127.0.0.1:8000/docs")
    print("=" * 65)
    print(" Note: Do NOT open 0.0.0.0 in Windows browser (use localhost or 127.0.0.1)")
    print(" Press Ctrl+C to terminate all services.")
    print("-" * 65)

    # 1. Start Next.js frontend dev server in background
    frontend_proc = None
    try:
        frontend_proc = subprocess.Popen(
            ["npm.cmd" if sys.platform == "win32" else "npm", "run", "dev"],
            cwd=str(frontend_dir),
            shell=True,
        )
        print("[+] Started Next.js Frontend Dashboard on http://localhost:3000")
    except Exception as e:
        print(f"[-] Could not start Next.js automatically ({e}). You can run 'npm run dev' in frontend/.")

    # 2. Run Uvicorn FastAPI backend on 127.0.0.1:8000
    try:
        import uvicorn
        uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
    except KeyboardInterrupt:
        print("\n[!] Shutting down LaunderyLens...")
    finally:
        if frontend_proc:
            try:
                frontend_proc.terminate()
            except Exception:
                pass

if __name__ == "__main__":
    main()
