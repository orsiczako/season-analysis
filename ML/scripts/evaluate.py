# Kiértékelő script: Betölti a modellt és 3 grafikont készít a teszt adatokról.

import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.efficientnet import preprocess_input

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
MODEL_PATH = os.path.join(BASE_DIR, "models", "skin_accurate_model.keras")
DATA_DIR = os.path.join(BASE_DIR, "data", "skin_type", "test")
IMG_SIZE = 300
CLASSES = ['oily', 'dry', 'normal']

# Betöltés
try:
    model = load_model(MODEL_PATH, compile=False)
    test_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
    test_data = test_datagen.flow_from_directory(
        DATA_DIR, target_size=(IMG_SIZE, IMG_SIZE), batch_size=16,
        class_mode="categorical", classes=CLASSES, shuffle=False
    )
except Exception as e:
    print(f"Hiba: {e}")
    exit()

# Predikció
print("Elemzés folyamatban")
Y_pred_probs = model.predict(test_data, verbose=1)
y_pred = np.argmax(Y_pred_probs, axis=1)
y_true = test_data.classes

# Számítások
cm = confusion_matrix(y_true, y_pred)
per_class_accuracy = cm.diagonal() / cm.sum(axis=1) * 100

correct_conf = [np.max(p) for i, p in enumerate(Y_pred_probs) if y_pred[i] == y_true[i]]
wrong_conf = [np.max(p) for i, p in enumerate(Y_pred_probs) if y_pred[i] != y_true[i]]

# Megjelenítés (3 ablak)

# Mátrix
plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=CLASSES, yticklabels=CLASSES)
plt.title('Tévesztési Mátrix')
plt.show()

# Pontosság
plt.figure(figsize=(6, 5))
bars = plt.bar(CLASSES, per_class_accuracy, color=['#ff9999','#66b3ff','#99ff99'])
plt.title('Pontosság')
plt.ylim(0, 110)
for bar in bars:
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height(), f"{bar.get_height():.1f}%", ha='center', va='bottom')
plt.show()

#  Hisztogram
plt.figure(figsize=(6, 5))
plt.hist(correct_conf, bins=10, alpha=0.7, color='green', label='Jó tipp')
if wrong_conf:
    plt.hist(wrong_conf, bins=10, alpha=0.7, color='red', label='Rossz tipp')
plt.legend()
plt.title('Magabiztosság')
plt.show()
