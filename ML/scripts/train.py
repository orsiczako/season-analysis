import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models, callbacks, optimizers, regularizers
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.applications.efficientnet import preprocess_input
import os
import numpy as np
from sklearn.utils import class_weight

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
DATA_DIR = os.path.join(BASE_DIR, "data", "skin_type")

# EfficientNetB3 ideális felbontása
IMG_HEIGHT, IMG_WIDTH = 300, 300 
# Azért 16, mert a 300x300-as képek és az EfficientNetB3 modell együtt sok memóriát esznek
BATCH_SIZE = 16 

# Csak ezt a 3-at tanítjuk (a kombináltat máshogy kezeljük)
SELECTED_CLASSES = ['oily', 'dry', 'normal']

# Ellenőrzés, hogy létezik-e a mappa
if not os.path.exists(DATA_DIR):
    print("A mappa nem található")
    exit()

train_datagen = ImageDataGenerator(
    # A bemenet egy kép, pixelek értéke 0 és 255 között van (RGB)
    preprocessing_function=preprocess_input,
    # -90 és +90 fok közötti elforgatás
    rotation_range=90,
    # eltolja a képet vízszintesen és függőlegesen 20%-kal           
    width_shift_range=0.2,
    height_shift_range=0.2,
    # 70% és 130% közötti nagyítás/kicsinyítés
    zoom_range=0.3,              
    brightness_range=[0.7, 1.3], 
    # Tükrözés
    horizontal_flip=True,
    vertical_flip=True,   
    # Transzformációkor keletkező üres részeket a kép szélének tükrözésével tölti ki.       
    fill_mode='reflect'          
)

try:
    train_data = train_datagen.flow_from_directory(
        os.path.join(DATA_DIR, "train"),
        # Átméretezés
        target_size=(IMG_HEIGHT, IMG_WIDTH),
        batch_size=BATCH_SIZE,
        # A kimenet egy vektor [1,0,0], [0,1,0], [0,0,1], a háló kimenete 3 db valószínűség (Softmax)
        class_mode="categorical",
        # Csak a kiválasztott osztályokat olvassa
        classes=SELECTED_CLASSES,
        shuffle=True
    )
except FileNotFoundError:
    print("A 'data/train' nem található!")
    exit()

# Itt konfiguráljuk a validációs generátort: csk normalizálás, torzítás nélkül!
valid_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

valid_data = valid_datagen.flow_from_directory(
    os.path.join(DATA_DIR, "valid"),
    target_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    classes=SELECTED_CLASSES,
    # Fix sorrend kell az eredmények pontos visszakövetéséhez
    shuffle=False
)

# Ha 0 képet talált, megállunk
if train_data.samples == 0:
    print("Nem található kép")
    exit()

try:
    class_weights = class_weight.compute_class_weight(
        class_weight='balanced',
        # Az osztályok indexei
        classes=np.unique(train_data.classes),
        # A tanító adatok osztálycímei
        y=train_data.classes
    )
    # Visszaadja az index-súly párokat szótárként
    class_weights_dict = dict(enumerate(class_weights))
    print("Súlyok:", class_weights_dict)
except:
    class_weights_dict = None

#Épít
base_model = EfficientNetB3(
    weights="imagenet", # Előtanított tudás betöltése (látja a textúrákat).
    include_top=False, # Eredeti kimenet eldobása (hogy a saját osztályozónkat tegyük rá).
    input_shape=(IMG_HEIGHT, IMG_WIDTH, 3)
)
# Alapmodell fagyasztása, a tanítás elején a még pontatlan osztályozónk ne rontsa el őket.
base_model.trainable = False 

#Értelmez
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    
    layers.Dense(512, activation="relu", kernel_regularizer=regularizers.l2(0.001)),
    layers.Dropout(0.5), 
    layers.Dense(256, activation="relu"),
    layers.Dropout(0.3),
    
    # Kimeneti réteg: 3 osztály (oily, dry, normal)
    layers.Dense(3, activation="softmax") 
])

MODEL_SAVE_PATH = os.path.join(BASE_DIR, "models", "skin_accurate_model.keras")

callbacks_list = [
    # Korai megállítás, ha a validációs pontosság 12 epochon keresztül nem javul, a restore_best_weights=True miatt a legjobb súlyokra kerül visszaállításra.
    callbacks.EarlyStopping(monitor='val_accuracy', patience=12, restore_best_weights=True, verbose=1),
    # Ha a validációs veszteség 4 epochon keresztül nem javul, csökkenti a tanulási rátát.
    callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=4, min_lr=1e-7, verbose=1),
    # A legjobb modell mentése a validációs pontosság alapján.
    callbacks.ModelCheckpoint(MODEL_SAVE_PATH, save_best_only=True, monitor='val_accuracy')
]

# Hogyan tanuljon
model.compile(optimizer=optimizers.Adam(learning_rate=0.001), loss="categorical_crossentropy", metrics=["accuracy"])
# Első kör: csak az osztályozó rétegek tanítása, a bázismodell fagyasztva.
model.fit(train_data, validation_data=valid_data, epochs=10, callbacks=callbacks_list, class_weight=class_weights_dict)

# Második kör: a bázismodell utolsó 100 rétegének felengedése és finomhangolás, ebben a rétegben a komplexebb jellemzők találhatók.
base_model.trainable = True
for layer in base_model.layers[:-100]:
    layer.trainable = False

# Finomhangolás alacsonyabb tanulási rátával
model.compile(optimizer=optimizers.Adam(learning_rate=0.0001), loss="categorical_crossentropy", metrics=["accuracy"])
# Az osztályozó rétegek és a bázismodell egy része tanul
model.fit(train_data, validation_data=valid_data, epochs=15, callbacks=callbacks_list, class_weight=class_weights_dict)

# Harmadik kör: az egész modell felengedése és további finomhangolás
base_model.trainable = True
# Minden réteg tanul
model.compile(optimizer=optimizers.Adam(learning_rate=0.00001), loss="categorical_crossentropy", metrics=["accuracy"])


history_final = model.fit(
    train_data, 
    validation_data=valid_data, 
    epochs=25, 
    callbacks=callbacks_list, 
    class_weight=class_weights_dict
)

print("A modell elkészült.")
