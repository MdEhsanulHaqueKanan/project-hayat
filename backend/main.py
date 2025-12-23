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

app = FastAPI(title="Project Hayat API (Multimodal)")

# ---------------------------------------------------------
# CONFIG
# ---------------------------------------------------------
USE_REAL_AI = True
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# LOAD AI MODELS
# ---------------------------------------------------------
vision_model = None
audio_model = None

if USE_REAL_AI:
    print(f"🚀 Loading AI Models on {DEVICE}...")

    # 1. LOAD VISION MODEL (YOLO)
    vision_path = "models/hayat_v1.pt"
    if os.path.exists(vision_path):
        try:
            vision_model = YOLO(vision_path)
            print("✅ Vision Model (Eagle Eye) Loaded!")
        except Exception as e:
            print(f"❌ Vision Init Failed: {e}")
    
    # 2. LOAD AUDIO MODEL (ResNet18)
    audio_path = "models/audio_v1.pt"
    if os.path.exists(audio_path):
        try:
            # We must recreate the architecture exactly as we trained it
            audio_model = models.resnet18(pretrained=False)
            num_ftrs = audio_model.fc.in_features
            audio_model.fc = nn.Linear(num_ftrs, 2) # Binary Class
            
            # Load weights
            state_dict = torch.load(audio_path, map_location=DEVICE)
            audio_model.load_state_dict(state_dict)
            audio_model.to(DEVICE)
            audio_model.eval() # Set to evaluation mode
            print("✅ Audio Model (The Listener) Loaded!")
        except Exception as e:
            print(f"❌ Audio Init Failed: {e}")

# ---------------------------------------------------------
# HELPER: Audio -> Spectrogram -> Tensor
# ---------------------------------------------------------
def process_audio_file(audio_bytes):
    # 1. Load audio from bytes
    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050, duration=3)
    
    # Pad if too short
    if len(y) < 22050 * 3:
        y = np.pad(y, (0, 22050 * 3 - len(y)))
        
    # 2. Generate Spectrogram
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    S_dB = librosa.power_to_db(S, ref=np.max)
    
    # 3. Save to buffer as Image (Greyscale to RGB)
    plt.figure(figsize=(2.24, 2.24))
    librosa.display.specshow(S_dB, sr=sr)
    plt.axis('off')
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close()
    buf.seek(0)
    
    # 4. Transform for PyTorch
    image = Image.open(buf).convert('RGB')
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    return transform(image).unsqueeze(0).to(DEVICE)

# ---------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------

@app.get("/")
def read_root():
    return {"status": "System Operational", "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"}

@app.post("/analyze/image")
async def analyze_image(file: UploadFile = File(...)):
    """ EAGLE EYE: Detects Building Damage """
    if not vision_model:
        return {"error": "Vision AI not loaded"}
    
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
    """ THE LISTENER: Detects Human Screams """
    if not audio_model:
        return {"error": "Audio AI not loaded"}
    
    try:
        # Process Audio
        contents = await file.read()
        input_tensor = process_audio_file(contents)
        
        # Run Inference
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
        print(f"Audio Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))