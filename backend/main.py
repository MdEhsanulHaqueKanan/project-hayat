from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import os

app = FastAPI(title="Project Hayat API")

# ---------------------------------------------------------
# CONFIG: Laptop Mode vs Desktop Mode
# ---------------------------------------------------------
# Set this to False if your laptop freezes.
# If True, it loads the real AI. If False, it returns fake data.
USE_REAL_AI = True 

# ---------------------------------------------------------
# CORS (Allow React Frontend to talk to this API)
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# LOAD MODEL (Only if USE_REAL_AI is True)
# ---------------------------------------------------------
model = None
if USE_REAL_AI:
    model_path = "models/hayat_v1.pt"
    if os.path.exists(model_path):
        print(f"✅ Loading AI Model from {model_path}...")
        try:
            model = YOLO(model_path)
            print("🚀 Model Loaded Successfully!")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
    else:
        print(f"⚠️ Model file not found at {model_path}. Check your path!")

@app.get("/")
def read_root():
    return {"status": "System Operational", "project": "Hayat v1.0"}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Receives an image, runs AI, and returns Damaged/Safe status.
    """
    
    # 1. Read Image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    # 2. Logic Switch
    if USE_REAL_AI and model:
        # --- REAL AI MODE ---
        results = model.predict(image)
        result = results[0]
        
        # Get top prediction
        class_id = result.probs.top1
        class_name = result.names[class_id]
        confidence = float(result.probs.top1conf)
        
        return {
            "mode": "REAL_AI",
            "prediction": class_name.upper(), # "DAMAGED" or "UNDAMAGED"
            "confidence": f"{confidence:.2%}",
            "filename": file.filename
        }
    else:
        # --- LAPTOP / DEMO MODE ---
        # Returns fake data to test UI
        import random
        is_damaged = random.choice([True, False])
        return {
            "mode": "SIMULATION",
            "prediction": "DAMAGED" if is_damaged else "UNDAMAGED",
            "confidence": "98.5%",
            "note": "Real AI disabled to save CPU"
        }