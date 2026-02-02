# Skin problems prediction - FIXED JSON STRUCTURE
# Logika: Dominancia szabály (Acne > Redness)
# Javítás: A JSON kimenet "laposítása", hogy a Backend megértse

import os
import sys
import json
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 

import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications.efficientnet import preprocess_input

# --- KONFIG ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
MODEL_PATH = os.path.join(BASE_DIR, "models", "skin_problems_model.keras")
IMG_SIZE = 300 
CLASSES = ['Acne', 'Bags', 'Milia', 'Redness', 'Scars', 'WhiteHead']

CLASS_NAMES_HU = {
    'Acne': 'Pattanás',
    'Bags': 'Szem alatti táska',
    'Milia': 'Milia (fehér csomók)',
    'Redness': 'Bőrpír',
    'Scars': 'Hegek',
    'WhiteHead': 'Mitesszer'
}

# --- ALAP KÜSZÖBÖK ---
THRESHOLDS = {
    'Acne': 0.4,      # 40%
    'Bags': 0.10,
    'Milia': 0.05,
    'Redness': 0.10,   
    'Scars': 0.05,
    'WhiteHead': 0.05
}
DEFAULT_THRESHOLD = 0.05

def apply_dermatology_logic(raw_scores):
    """
    Acne dominancia logika: Ha van pattanás gyanú, az felülírja a bőrpírt.
    """
    adjusted_scores = raw_scores.copy()
    
    acne_score = raw_scores.get('Acne', 0.0)
    redness_score = raw_scores.get('Redness', 0.0)
    
    # Ha van gyanú Acnéra (> 4%), de a gép szerint a Redness sokkal erősebb...
    if acne_score > 0.04 and redness_score > acne_score:
        # Pattanás megkapja a Redness pontszámát + bónuszt
        adjusted_scores['Acne'] = redness_score + 0.05
        # Redness csökken
        adjusted_scores['Redness'] = redness_score * 0.4
        
        if adjusted_scores['Acne'] > 0.99: adjusted_scores['Acne'] = 0.99
        
    return adjusted_scores

def predict_skin_problems(image_path):
    if not os.path.isabs(image_path):
        image_path = os.path.join(BASE_DIR, image_path)
    if not os.path.exists(image_path):
        return {"error": "Kép nem található"}
    if not os.path.exists(MODEL_PATH):
        return {"error": "Modell nem található"}
    
    try:
        model = load_model(MODEL_PATH, compile=False)
        img = load_img(image_path, target_size=(IMG_SIZE, IMG_SIZE))
        img_array = img_to_array(img)
        img_array = preprocess_input(img_array)
        img_array = np.expand_dims(img_array, axis=0)
        
        predictions = model.predict(img_array, verbose=0)[0]
        
        # 1. Nyers pontszámok
        raw_scores_dict = {}
        for i, class_name in enumerate(CLASSES):
            raw_scores_dict[class_name] = float(predictions[i])
            
        # 2. Logikai javítás
        final_scores_dict = apply_dermatology_logic(raw_scores_dict)
        
        # 3. Kimenet összeállítása
        all_problems = {}
        detected_problems = []
        
        # Sorba rendezés
        sorted_items = sorted(final_scores_dict.items(), key=lambda x: x[1], reverse=True)

        for class_key, score in sorted_items:
            threshold_val = THRESHOLDS.get(class_key, DEFAULT_THRESHOLD)
            confidence_percent = score * 100
            
            is_detected = score >= threshold_val
            
            hu_name = CLASS_NAMES_HU[class_key]
            
            all_problems[class_key] = {
                "confidence": round(confidence_percent, 2),
                "detected": is_detected,
                "name_hu": hu_name
            }
            
            if is_detected:
                detected_problems.append({
                    "problem": class_key,
                    "name_hu": hu_name,
                    "confidence": round(confidence_percent, 2)
                })

        # --- JAVÍTÁS: KIVETTÜK A "success" és "data" CSOMAGOLÁST ---
        # Így a Backend közvetlenül megkapja a listát, ahogy régen.
        output = {
            "detected": detected_problems,
            "detected_count": len(detected_problems),
            "all_scores": all_problems,
            "has_problems": len(detected_problems) > 0
        }
        
        return output
        
    except Exception as e:
        # Hiba esetén is egyszerű struktúra kell
        return {"error": str(e), "detected": [], "has_problems": False}

def main():
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        result = predict_skin_problems(image_path)
        print(json.dumps(result, ensure_ascii=False))
    else:
        print(json.dumps({"error": "Használat: python predict.py <kep_utvonal>"}))

if __name__ == "__main__":
    main()