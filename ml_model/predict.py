import tensorflow as tf
import numpy as np
from PIL import Image
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

class DiseasePredictor:
    def __init__(self, model_path=None, label_map_path=None):
        self.model = None
        self.label_map = {}
        if model_path is None:
            model_path = os.path.join(SCRIPT_DIR, 'plant_disease_model.h5')
        if label_map_path is None:
            label_map_path = os.path.join(SCRIPT_DIR, 'label_map.json')
        if os.path.exists(model_path):
            self.model = tf.keras.models.load_model(model_path)
        if os.path.exists(label_map_path):
            with open(label_map_path, 'r') as f:
                self.label_map = json.load(f)
    
    def predict(self, image_path):
        if self.model is None:
            return None, None, None
        img = Image.open(image_path)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        predictions = self.model.predict(img_array, verbose=0)
        predicted_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_idx])
        class_name = self.label_map.get(str(predicted_idx), 'Unknown')
        
        parts = class_name.split('___')
        plant = parts[0].replace('_', ' ') if len(parts) > 0 else 'Unknown'
        disease = parts[1].replace('_', ' ') if len(parts) > 1 else 'Unknown'
        if disease.lower() == 'healthy':
            disease = 'Healthy'
        
        return plant, disease, confidence

if __name__ == '__main__':
    predictor = DiseasePredictor()
    import sys
    if len(sys.argv) > 1:
        plant, disease, conf = predictor.predict(sys.argv[1])
        print(f"Plant: {plant}")
        print(f"Disease: {disease}")
        print(f"Confidence: {conf*100:.2f}%")
