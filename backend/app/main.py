from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, missions

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(missions.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Shield API"} 