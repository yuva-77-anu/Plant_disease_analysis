import tensorflow as tf
import matplotlib.pyplot as plt
import json
import os
from model import build_model
from data_loader import create_data_generators

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

DATA_DIR = os.path.join(PROJECT_ROOT, 'dataset')
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15
MODEL_PATH = os.path.join(SCRIPT_DIR, 'plant_disease_model.h5')
LABEL_MAP_PATH = os.path.join(SCRIPT_DIR, 'label_map.json')
HISTORY_PLOT_PATH = os.path.join(SCRIPT_DIR, 'training_history.png')

def train():
    if not os.path.exists(DATA_DIR):
        print(f"Error: Dataset directory '{DATA_DIR}' not found.")
        print("Please download the PlantVillage dataset and place it in the 'dataset' folder.")
        print("Expected structure: dataset/plant_name/disease_name/image.jpg")
        return
    
    print("Loading data...")
    train_gen, val_gen = create_data_generators(DATA_DIR, IMG_SIZE, BATCH_SIZE)
    num_classes = len(train_gen.class_indices)
    print(f"Found {num_classes} classes: {list(train_gen.class_indices.keys())}")
    
    print("Building model...")
    model = build_model(num_classes, input_shape=(*IMG_SIZE, 3))
    
    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        MODEL_PATH, monitor='val_accuracy', save_best_only=True, mode='max', verbose=1
    )
    early_stop = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True, verbose=1)
    reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=1e-7, verbose=1)
    
    print("Training model...")
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        callbacks=[checkpoint, early_stop, reduce_lr]
    )
    
    label_map = {str(v): k for k, v in train_gen.class_indices.items()}
    with open(LABEL_MAP_PATH, 'w') as f:
        json.dump(label_map, f, indent=2)
    print(f"Label map saved to {LABEL_MAP_PATH}")
    
    plt.figure(figsize=(12, 4))
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Training Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig(HISTORY_PLOT_PATH)
    print(f"Training history plot saved to {HISTORY_PLOT_PATH}")
    
    val_loss, val_acc = model.evaluate(val_gen, verbose=0)
    print(f"\nFinal Validation Accuracy: {val_acc*100:.2f}%")
    print(f"Final Validation Loss: {val_loss:.4f}")

if __name__ == '__main__':
    train()
