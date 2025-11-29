import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.efficientnet import preprocess_input
import numpy as np
import os
import cv2

# A script saját mappájában keresi a modellt
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "skin_accurate_model.keras")
IMG_SIZE = 300 #300 x 300
CLASSES = ['oily', 'dry', 'normal']

def predict_image(image_path):
    
    # Teljes útvonal javítása
    if not os.path.isabs(image_path):
        image_path = os.path.join(BASE_DIR, image_path)

    if not os.path.exists(image_path):
        print("A kép nem található")
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
    print(f"Fájl: {os.path.basename(image_path)}")

    # Százalékok kiírása
    results = {}
    for i, label in enumerate(CLASSES):
        percent = score[i] * 100
        results[label] = percent
        bar = "█" * int(percent // 5) 
        print(f"{label.upper().ljust(8)}: {percent:5.1f}%  {bar}")

    winner = CLASSES[np.argmax(score)]
    confidence = np.max(score) * 100

    # Ha a Zsíros > 35% ÉS Száraz > 20%, akkor felülírjuk az eredményt
    if results['oily'] > 35 and results['dry'] > 20:
        winner = "kombinált"

    print(f"Diagnózis eredménye: {winner} ")
    print(f"Magabiztosság:  {confidence:.1f}%")
    

# Tesztelendő kép neve
test_img = "oily.jpg" 

predict_image(test_img)