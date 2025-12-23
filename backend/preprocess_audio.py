import os
import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np
from concurrent.futures import ProcessPoolExecutor
from tqdm import tqdm

# CONFIG
DATA_DIR = r"data"
OUTPUT_DIR = r"data_spectrograms"
SAMPLE_RATE = 22050
DURATION = 3 # We only look at 3 second clips (fast processing)

def create_spectrogram(file_path, save_path):
    try:
        # 1. Load Audio
        y, sr = librosa.load(file_path, sr=SAMPLE_RATE, duration=DURATION)
        
        # Padding if too short
        if len(y) < SAMPLE_RATE * DURATION:
            y = np.pad(y, (0, SAMPLE_RATE * DURATION - len(y)))

        # 2. Generate Mel Spectrogram
        S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        S_dB = librosa.power_to_db(S, ref=np.max)

        # 3. Save as Image (No axis, no whitespace - just pure data)
        plt.figure(figsize=(2.24, 2.24)) # Output will be 224x224 pixels
        librosa.display.specshow(S_dB, sr=sr)
        plt.axis('off')
        plt.savefig(save_path, bbox_inches='tight', pad_inches=0)
        plt.close()
        return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def process_category(category):
    source_path = os.path.join(DATA_DIR, category)
    target_path = os.path.join(OUTPUT_DIR, category)
    os.makedirs(target_path, exist_ok=True)
    
    files = [f for f in os.listdir(source_path) if f.endswith('.wav')]
    print(f"🎵 Processing {len(files)} audio files for: {category}")

    # Use CPU Cores to speed up
    with ProcessPoolExecutor() as executor:
        futures = []
        for f in files:
            img_name = f.replace('.wav', '.png')
            save_path = os.path.join(target_path, img_name)
            futures.append(executor.submit(create_spectrogram, os.path.join(source_path, f), save_path))
        
        # Progress Bar
        for _ in tqdm(futures):
            pass

if __name__ == "__main__":
    print("🚀 Starting Audio -> Image Conversion...")
    process_category("screams")
    process_category("noise")
    print("✅ Conversion Complete! Check 'backend/data_spectrograms' folder.")