import json
import os
import uuid

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from backend.extensions import db
from backend.models import User, Prediction, DiseaseInfo
from backend.config import config

predict_bp = Blueprint("predict", __name__)

_model = None
_label_map = None


def _load_tf():
    try:
        import tensorflow as tf
        return tf
    except Exception as e:
        raise RuntimeError(
            "TensorFlow is not installed or not compatible with this Python version."
        ) from e


def _load_model_and_labels():
    global _model, _label_map
    tf = _load_tf()
    if _model is None:
        if not os.path.exists(config.ML_MODEL_PATH):
            raise FileNotFoundError(
                f"ML model not found at {config.ML_MODEL_PATH}. "
                "Place plant_disease_model.h5 in the ml_model directory."
            )
        _model = tf.keras.models.load_model(config.ML_MODEL_PATH, compile=False)

    if _label_map is None:
        if not os.path.exists(config.LABEL_MAP_PATH):
            raise FileNotFoundError(
                f"Label map not found at {config.LABEL_MAP_PATH}. "
                "Place label_map.json in the ml_model directory."
            )
        with open(config.LABEL_MAP_PATH, "r", encoding="utf-8") as f:
            _label_map = json.load(f)
    return _model, _label_map


def preprocess_image(image_path):
    from PIL import Image
    import numpy as np

    img = Image.open(image_path)
    if img.mode != "RGB":
        img = img.convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img, dtype="float32") / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def _allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS
    )


def _parse_label(label):
    if not label:
        return "Unknown", "Unknown"
    label = str(label).strip()
    if "___" in label:
        parts = label.split("___", 1)
    elif " - " in label:
        parts = label.split(" - ", 1)
    elif "_" in label:
        parts = label.split("_", 1)
    else:
        parts = [label, ""]

    plant = parts[0].replace("_", " ").strip()
    disease = parts[1].replace("_", " ").strip() if len(parts) > 1 else ""
    if not disease:
        disease = "Healthy" if "healthy" in plant.lower() else "Unknown"
    return plant, disease


def _resolve_label(idx, label_map):
    # label_map may map int->name, str(int)->name, or name->index
    candidates = [idx, str(idx)]
    for key in candidates:
        if key in label_map:
            return label_map[key]
    for key, value in label_map.items():
        if str(value) == str(idx):
            return key
    return None


def _default_details(plant_name, disease_name):
    healthy = disease_name.lower() in ("healthy", "no disease", "unknown")
    if healthy:
        return {
            "description": f"The {plant_name} plant appears healthy with no signs of disease.",
            "treatment": "No treatment required. Continue routine care.",
            "organic_treatment": "Maintain good cultural practices such as proper watering and mulch.",
            "fertilizer": "Use a balanced fertilizer as per the plant's normal schedule.",
            "prevention_tips": "Regular monitoring, crop rotation, and clean gardening tools help prevent disease.",
            "symptoms": "No visible symptoms of disease.",
        }
    return {
        "description": f"The model detected {disease_name} on the {plant_name} plant.",
        "treatment": (
            "Consult an agricultural expert. Apply a suitable fungicide/bactericide "
            "after confirming the diagnosis."
        ),
        "organic_treatment": (
            "Remove and destroy affected leaves. Use neem oil or a baking soda spray "
            "as an organic preventative measure."
        ),
        "fertilizer": (
            "Apply a potassium-rich fertilizer to strengthen the plant's natural defenses."
        ),
        "prevention_tips": (
            "Improve air circulation, avoid overhead watering, and practice crop rotation."
        ),
        "symptoms": "Discoloration, spots, or lesions typical of the detected disease.",
    }


def _build_disease_details(plant_name, disease_name):
    info = DiseaseInfo.query.filter(
        db.func.lower(DiseaseInfo.plant_name) == plant_name.lower(),
        db.func.lower(DiseaseInfo.disease_name) == disease_name.lower(),
    ).first()
    if info:
        return {
            "description": info.description,
            "treatment": info.treatment,
            "organic_treatment": info.organic_treatment,
            "fertilizer": info.fertilizer,
            "prevention_tips": info.prevention_tips,
            "symptoms": info.symptoms,
        }
    return _default_details(plant_name, disease_name)


@predict_bp.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    user_id = get_jwt_identity()

    if "image" not in request.files:
        return jsonify({"error": "No image file provided (field name: 'image')"}), 400

    file = request.files["image"]
    if not file or file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    if not _allowed_file(file.filename):
        return (
            jsonify({"error": "File type not allowed. Use png, jpg, jpeg, gif, bmp, webp"}),
            400,
        )

    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(config.UPLOAD_FOLDER, filename)
    file.save(save_path)

    try:
        tf = _load_tf()
        model, label_map = _load_model_and_labels()
        img_array = preprocess_image(save_path)
        predictions = model.predict(img_array)
        probs = predictions[0]
        idx = int(tf.argmax(probs).numpy())
        confidence = float(tf.reduce_max(probs).numpy())

        raw_label = _resolve_label(idx, label_map)
        plant_name, disease_name = _parse_label(raw_label)
        details = _build_disease_details(plant_name, disease_name)

        prediction = Prediction(
            user_id=int(user_id),
            plant_name=plant_name,
            disease_name=disease_name,
            confidence=round(confidence * 100, 2),
            image_path=filename,
            description=details["description"],
            treatment=details["treatment"],
            organic_treatment=details["organic_treatment"],
            fertilizer=details["fertilizer"],
            prevention_tips=details["prevention_tips"],
        )
        db.session.add(prediction)
        db.session.commit()

        return (
            jsonify(
                {
                    "id": prediction.id,
                    "plant_name": plant_name,
                    "disease_name": disease_name,
                    "confidence": prediction.confidence,
                    "description": details["description"],
                    "treatment": details["treatment"],
                    "organic_treatment": details["organic_treatment"],
                    "fertilizer": details["fertilizer"],
                    "prevention_tips": details["prevention_tips"],
                    "symptoms": details.get("symptoms"),
                    "image_path": filename,
                    "created_at": prediction.created_at.isoformat()
                    if prediction.created_at
                    else None,
                }
            ),
            200,
        )
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@predict_bp.route("/history", methods=["GET"])
@jwt_required()
def history():
    user_id = get_jwt_identity()
    try:
        limit = int(request.args.get("limit", 50))
        offset = int(request.args.get("offset", 0))
    except ValueError:
        return jsonify({"error": "limit and offset must be integers"}), 400

    limit = max(1, min(limit, 200))

    query = Prediction.query.filter_by(user_id=int(user_id)).order_by(
        Prediction.created_at.desc()
    )
    total = query.count()
    items = query.limit(limit).offset(offset).all()

    return (
        jsonify(
            {
                "total": total,
                "limit": limit,
                "offset": offset,
                "predictions": [p.to_dict() for p in items],
            }
        ),
        200,
    )


@predict_bp.route("/history/<int:prediction_id>", methods=["GET"])
@jwt_required()
def prediction_detail(prediction_id):
    user_id = get_jwt_identity()
    prediction = Prediction.query.filter_by(
        id=prediction_id, user_id=int(user_id)
    ).first()
    if not prediction:
        return jsonify({"error": "Prediction not found"}), 404
    return jsonify({"prediction": prediction.to_dict()}), 200


@predict_bp.route("/history/<int:prediction_id>", methods=["DELETE"])
@jwt_required()
def delete_prediction(prediction_id):
    user_id = get_jwt_identity()
    prediction = Prediction.query.filter_by(
        id=prediction_id, user_id=int(user_id)
    ).first()
    if not prediction:
        return jsonify({"error": "Prediction not found"}), 404

    full_path = os.path.join(config.UPLOAD_FOLDER, prediction.image_path)
    if os.path.exists(full_path):
        try:
            os.remove(full_path)
        except OSError:
            pass

    db.session.delete(prediction)
    db.session.commit()
    return jsonify({"message": "Prediction deleted"}), 200
