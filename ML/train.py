import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models, callbacks, optimizers, regularizers
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.applications.efficientnet import preprocess_input
import os
import numpy as np
from sklearn.utils import class_weight

# A script megkeresi, hogy ő maga hol van (D:\Webfejl\ML), és ott keresi a data-t
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.join(SCRIPT_DIR, "data")

# EfficientNetB3 ideális felbontása
IMG_HEIGHT, IMG_WIDTH = 300, 300 

BATCH_SIZE = 16 

# Csak ezt a 3-at tanítjuk (a kombináltat máshogy kezeljük)
SELECTED_CLASSES = ['oily', 'dry', 'normal']

# Ellenőrzés, hogy létezik-e a mappa
if not os.path.exists(BASE_DIR):
    print("A mappa nem található")
    exit()

train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=90,           
    width_shift_range=0.2,
    height_shift_range=0.2,
    zoom_range=0.3,              
    brightness_range=[0.7, 1.3], 
    horizontal_flip=True,
    vertical_flip=True,          
    fill_mode='reflect'          
)

try:
    train_data = train_datagen.flow_from_directory(
        os.path.join(BASE_DIR, "train"),
        target_size=(IMG_HEIGHT, IMG_WIDTH),
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        classes=SELECTED_CLASSES,
        shuffle=True
    )
except FileNotFoundError:
    print("A 'data/train' nem található!")
    exit()

valid_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

valid_data = valid_datagen.flow_from_directory(
    os.path.join(BASE_DIR, "valid"),
    target_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    classes=SELECTED_CLASSES,
    shuffle=False
)

# Ha 0 képet talált, megállunk
if train_data.samples == 0:
    print("Nem található kép")
    exit()

try:
    class_weights = class_weight.compute_class_weight(
        class_weight='balanced',
        classes=np.unique(train_data.classes),
        y=train_data.classes
    )
    class_weights_dict = dict(enumerate(class_weights))
    print("Súlyok:", class_weights_dict)
except:
    class_weights_dict = None

print("Modell építése")
base_model = EfficientNetB3(
    weights="imagenet",
    include_top=False,
    input_shape=(IMG_HEIGHT, IMG_WIDTH, 3)
)
base_model.trainable = False 

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    
    layers.Dense(512, activation="relu", kernel_regularizer=regularizers.l2(0.001)),
    layers.Dropout(0.5), 
    layers.Dense(256, activation="relu"),
    layers.Dropout(0.3),
    
    layers.Dense(3, activation="softmax") 
])

callbacks_list = [
    callbacks.EarlyStopping(monitor='val_accuracy', patience=12, restore_best_weights=True, verbose=1),
    callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=4, min_lr=1e-7, verbose=1),
    callbacks.ModelCheckpoint("models/skin_accurate_model.keras", save_best_only=True, monitor='val_accuracy')
]


model.compile(optimizer=optimizers.Adam(learning_rate=0.001), loss="categorical_crossentropy", metrics=["accuracy"])
model.fit(train_data, validation_data=valid_data, epochs=10, callbacks=callbacks_list, class_weight=class_weights_dict)

base_model.trainable = True
for layer in base_model.layers[:-100]:
    layer.trainable = False

model.compile(optimizer=optimizers.Adam(learning_rate=0.0001), loss="categorical_crossentropy", metrics=["accuracy"])
model.fit(train_data, validation_data=valid_data, epochs=15, callbacks=callbacks_list, class_weight=class_weights_dict)

base_model.trainable = True
model.compile(optimizer=optimizers.Adam(learning_rate=0.00001), loss="categorical_crossentropy", metrics=["accuracy"])

history_final = model.fit(
    train_data, 
    validation_data=valid_data, 
    epochs=25, 
    callbacks=callbacks_list, 
    class_weight=class_weights_dict
)

print("A modell elkészült.")