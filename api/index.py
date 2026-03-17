from fastapi import FastAPI
import os

app = FastAPI()

@app.get("/api/v1/health")
def health():
    return {"status": "ok", "mode": "minimal_test"}

@app.get("/api/v1/env")
def env_check():
    return {"keys": list(os.environ.keys())}
