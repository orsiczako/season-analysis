# Multi-label skin problems classification
# Ezzel a módszerrel egy képen több probléma is detektálható egyszerre (pl. Acne + Redness)

import os
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks, optimizers
from tensorflow.keras.applications import EfficientNetB3 
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
DATA_DIR = os.path.join(BASE_DIR, "data", "skin_problems")

IMG_SIZE = 300 
BATCH_SIZE = 16 

CLASSES = ['Acne', 'Bags', 'Milia', 'Redness', 'WhiteHead']
NUM_CLASSES = len(CLASSES)

print(f"Osztályok ({NUM_CLASSES} db): {CLASSES}")


train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    validation_split=0.15
)

test_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

train_generator = train_datagen.flow_from_directory(
    os.path.join(DATA_DIR, "Train"),
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical', 
    classes=CLASSES,
    subset='training',
    shuffle=True
)

val_generator = train_datagen.flow_from_directory(
    os.path.join(DATA_DIR, "Train"),
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    classes=CLASSES,
    subset='validation',
    shuffle=False
)

test_generator = test_datagen.flow_from_directory(
    os.path.join(DATA_DIR, "Test"),
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    classes=CLASSES,
    shuffle=False
)


base_model = EfficientNetB3(
    weights="imagenet",
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)
base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),

    layers.Dense(256, activation="relu"),
    layers.Dropout(0.5),
    layers.Dense(128, activation="relu"),
    layers.Dropout(0.3),
    # Sigmoid: Több probléma is lehet egyszerre (Multi-label)
layers.Dense(NUM_CLASSES, activation="sigmoid") 
])

model.summary()

MODEL_SAVE_PATH = os.path.join(BASE_DIR, "models", "skin_problems_model.keras")

callbacks_list = [
    callbacks.EarlyStopping(
        monitor='val_loss', 
        patience=8, 
        restore_best_weights=True, 
        verbose=1
    ),
    callbacks.ReduceLROnPlateau(
        monitor='val_loss', 
        factor=0.5, 
        patience=3, 
        min_lr=1e-7, 
        verbose=1
    ),
    callbacks.ModelCheckpoint(
        MODEL_SAVE_PATH, 
        save_best_only=True, 
        monitor='val_binary_accuracy'
    )
]


model.compile(
    optimizer=optimizers.Adam(learning_rate=0.001),
    loss="binary_crossentropy", # Multi-label hiba
    metrics=["binary_accuracy"]
)

history1 = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=15,
    callbacks=callbacks_list
)

base_model.trainable = True

for layer in base_model.layers[:-100]:
    layer.trainable = False

model.compile(
    optimizer=optimizers.Adam(learning_rate=0.0001),
    loss="binary_crossentropy",
    metrics=["binary_accuracy"]
)

history2 = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=20,  # Érdemes legalább 15-20 epochot adni neki itt
    callbacks=callbacks_list
)



# 1. Minden réteg feloldása (már True volt, de biztos ami biztos)
base_model.trainable = True 

# 2. Nagyon lassú tanulási ráta
model.compile(
    optimizer=optimizers.Adam(learning_rate=0.00001), 
    loss="binary_crossentropy",
    metrics=["binary_accuracy"]
)

# 3. Tanítás
history3 = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=25,
    callbacks=callbacks_list
)

test_loss, test_acc = model.evaluate(test_generator)
print(f"Test loss: {test_loss:.4f}")
print(f"Test binary accuracy: {test_acc:.4f}")

print(f"\nModell mentve: {MODEL_SAVE_PATH}")
model.save(MODEL_SAVE_PATH) 