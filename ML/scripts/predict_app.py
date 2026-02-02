import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.efficientnet import preprocess_input
import numpy as np
import os
import sys
import json

# A script a scripts mappában van, szóval .. kell a models mappához
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
MODEL_PATH = os.path.join(BASE_DIR, "models", "skin_accurate_model.keras")
IMG_SIZE = 300 #300 x 300
CLASSES = ['oily', 'dry', 'normal']

def predict_image(image_path):
    
    # Teljes útvonal javítása
    if not os.path.isabs(image_path):
        image_path = os.path.join(BASE_DIR, image_path)

    if not os.path.exists(image_path):
        print(json.dumps({"error": "Image not found"}))
        return

    # Modell betöltése 
    model = load_model(MODEL_PATH, compile=False)

    # Kép betöltése és előkészítése
    # Ugyanaz a logika, mint tanításnál
    img = image.load_img(image_path, target_size=(IMG_SIZE, IMG_SIZE))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) 
    img_array = preprocess_input(img_array)       

    # Predikció
    predictions = model.predict(img_array, verbose=0)
    score = predictions[0]

    # Eredmény formázása
    results = {}
    for i, label in enumerate(CLASSES):
        percent = float(score[i] * 100)
        results[label] = percent

    winner = CLASSES[np.argmax(score)]
    confidence = float(np.max(score) * 100)

    # Ha a Zsíros > 35% ÉS Száraz > 20%, akkor felülírjuk az eredményt
    if results['oily'] > 35 and results['dry'] > 20:
        winner = "combination"

    # JSON kimenet
    output = {
        "skinType": winner,
        "confidence": confidence,
        "details": results
    }
    
    print(json.dumps(output))

# Parancssori argumentum feldolgozása
if len(sys.argv) > 1:
    test_img = sys.argv[1]
else:
    test_img = "oily.jpg"

predict_image(test_img)
