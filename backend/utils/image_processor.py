import os

import numpy as np
from PIL import Image

IMG_SIZE = (224, 224)


def preprocess_image(image_path, target_size=IMG_SIZE):
    """Load an image from disk, resize it to `target_size`, convert it to an
    RGB float32 array, scale pixel values to [0, 1], and return a batch-ready
    numpy array of shape (1, height, width, 3)."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    with Image.open(image_path) as img:
        img = img.convert("RGB")
        img = img.resize(target_size, Image.BILINEAR)

        arr = np.array(img, dtype=np.float32) / 255.0
        arr = np.expand_dims(arr, axis=0)

    return arr


def load_image_array(image_path, target_size=IMG_SIZE):
    """Alias used by the prediction route."""
    return preprocess_image(image_path, target_size)
