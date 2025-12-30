from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import os
import torch
import torch.nn as nn
from torchvision import models, transforms
import librosa
import numpy as np
import matplotlib.pyplot as plt

# Initialize API
app = FastAPI(
    title="Project Hayat API",
    description="Multimodal Intelligence Platform for Urban Search & Rescue",
    version="2.0"
)

# --- CONFIGURATION ---
USE_REAL_AI = True
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODEL INITIALIZATION ---
vision_model = None
audio_model = None

if USE_REAL_AI:
    print(f"🚀 Initializing AI Models on {DEVICE}...")

    # Vision Model (YOLOv8)
    vision_path = "models/hayat_v1.pt"
    if os.path.exists(vision_path):
        try:
            vision_model = YOLO(vision_path)
            print(f"✅ Vision Model Loaded: {vision_path}")
        except Exception as e:
            print(f"❌ Vision Init Failed: {e}")
    
    # Audio Model (ResNet18)
    audio_path = "models/audio_v1.pt"
    if os.path.exists(audio_path):
        try:
            audio_model = models.resnet18(pretrained=False)
            num_ftrs = audio_model.fc.in_features
            audio_model.fc = nn.Linear(num_ftrs, 2)
            
            state_dict = torch.load(audio_path, map_location=DEVICE)
            audio_model.load_state_dict(state_dict)
            audio_model.to(DEVICE)
            audio_model.eval()
            print(f"✅ Audio Model Loaded: {audio_path}")
        except Exception as e:
            print(f"❌ Audio Init Failed: {e}")

# --- UTILITIES ---

def process_audio_file(audio_bytes):
    """
    Converts raw audio bytes into a Mel-Spectrogram tensor compatible with ResNet18.
    Applies padding to ensure consistent input size (3s duration).
    """
    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050, duration=3)
    
    # Pad input if shorter than 3 seconds
    if len(y) < 22050 * 3:
        y = np.pad(y, (0, 22050 * 3 - len(y)))
        
    # Generate Mel Spectrogram
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    S_dB = librosa.power_to_db(S, ref=np.max)
    
    # Render to buffer as greyscale image
    plt.figure(figsize=(2.24, 2.24))
    librosa.display.specshow(S_dB, sr=sr)
    plt.axis('off')
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close()
    buf.seek(0)
    
    # Transform for PyTorch Inference
    image = Image.open(buf).convert('RGB')
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    return transform(image).unsqueeze(0).to(DEVICE)

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "status": "System Operational", 
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    }

@app.post("/analyze/image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyzes drone imagery for structural damage (collapsed vs standing).
    Returns class prediction and confidence score.
    """
    if not vision_model:
        raise HTTPException(status_code=503, detail="Vision AI model not loaded")
    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    results = vision_model.predict(image)
    result = results[0]
    class_name = result.names[result.probs.top1].upper()
    confidence = float(result.probs.top1conf)
    
    return {
        "type": "VISION",
        "prediction": class_name,
        "confidence": f"{confidence:.2%}"
    }

@app.post("/analyze/audio")
async def analyze_audio(file: UploadFile = File(...)):
    """
    Analyzes audio stream for biological distress signals (human screams).
    Filters background machinery/drone noise.
    """
    if not audio_model:
        raise HTTPException(status_code=503, detail="Audio AI model not loaded")
    
    try:
        contents = await file.read()
        input_tensor = process_audio_file(contents)
        
        with torch.no_grad():
            outputs = audio_model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
            
        class_names = ['NOISE', 'SCREAM']
        result = class_names[predicted.item()]
        score = confidence.item()
        
        return {
            "type": "AUDIO",
            "prediction": result,
            "confidence": f"{score:.2%}"
        }
        
    except Exception as e:
        print(f"Audio Processing Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))