from functools import wraps

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from backend.extensions import db
from backend.models import User, Prediction, DiseaseInfo
from backend.config import config

admin_bp = Blueprint("admin", __name__)


def require_admin(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or not user.is_admin:
            return jsonify({"error": "Admin privileges required"}), 403
        return fn(*args, **kwargs)

    return wrapper


@admin_bp.route("/stats", methods=["GET"])
@require_admin
def stats():
    total_users = User.query.count()
    total_admins = User.query.filter_by(is_admin=True).count()
    total_predictions = Prediction.query.count()
    total_diseases = DiseaseInfo.query.count()

    most_common = (
        db.session.query(
            Prediction.plant_name,
            Prediction.disease_name,
            db.func.count(Prediction.id).label("cnt"),
        )
        .group_by(Prediction.plant_name, Prediction.disease_name)
        .order_by(db.func.count(Prediction.id).desc())
        .limit(5)
        .all()
    )

    top_diseases = [
        {"plant_name": r.plant_name, "disease_name": r.disease_name, "count": r.cnt}
        for r in most_common
    ]

    return (
        jsonify(
            {
                "total_users": total_users,
                "total_admins": total_admins,
                "total_predictions": total_predictions,
                "total_diseases": total_diseases,
                "top_detected_diseases": top_diseases,
            }
        ),
        200,
    )


@admin_bp.route("/users", methods=["GET"])
@require_admin
def list_users():
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", 20)), 100)
    pagination = User.query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return (
        jsonify(
            {
                "users": [u.to_dict() for u in pagination.items],
                "total": pagination.total,
                "page": page,
                "per_page": per_page,
                "pages": pagination.pages,
            }
        ),
        200,
    )


@admin_bp.route("/users/<int:user_id>", methods=["GET"])
@require_admin
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    prediction_count = Prediction.query.filter_by(user_id=user.id).count()
    data = user.to_dict()
    data["prediction_count"] = prediction_count
    return jsonify({"user": data}), 200


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@require_admin
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200


@admin_bp.route("/users/<int:user_id>/admin", methods=["PUT"])
@require_admin
def toggle_admin(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user.is_admin = not user.is_admin
    db.session.commit()
    return jsonify({"message": "User admin status updated", "user": user.to_dict()}), 200


@admin_bp.route("/predictions", methods=["GET"])
@require_admin
def list_predictions():
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", 20)), 100)
    pagination = Prediction.query.order_by(Prediction.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return (
        jsonify(
            {
                "predictions": [p.to_dict() for p in pagination.items],
                "total": pagination.total,
                "page": page,
                "per_page": per_page,
                "pages": pagination.pages,
            }
        ),
        200,
    )


@admin_bp.route("/diseases", methods=["GET"])
@require_admin
def list_diseases():
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", 50)), 200)
    pagination = DiseaseInfo.query.order_by(
        DiseaseInfo.plant_name, DiseaseInfo.disease_name
    ).paginate(page=page, per_page=per_page, error_out=False)
    return (
        jsonify(
            {
                "diseases": [d.to_dict() for d in pagination.items],
                "total": pagination.total,
                "page": page,
                "per_page": per_page,
                "pages": pagination.pages,
            }
        ),
        200,
    )


@admin_bp.route("/diseases", methods=["POST"])
@require_admin
def create_disease():
    data = request.get_json(silent=True) or {}
    plant_name = (data.get("plant_name") or "").strip()
    disease_name = (data.get("disease_name") or "").strip()

    if not plant_name or not disease_name:
        return jsonify({"error": "plant_name and disease_name are required"}), 400

    exists = DiseaseInfo.query.filter(
        db.func.lower(DiseaseInfo.plant_name) == plant_name.lower(),
        db.func.lower(DiseaseInfo.disease_name) == disease_name.lower(),
    ).first()
    if exists:
        return jsonify({"error": "Disease entry already exists"}), 409

    info = DiseaseInfo(
        plant_name=plant_name,
        disease_name=disease_name,
        description=data.get("description"),
        treatment=data.get("treatment"),
        organic_treatment=data.get("organic_treatment"),
        fertilizer=data.get("fertilizer"),
        prevention_tips=data.get("prevention_tips"),
        symptoms=data.get("symptoms"),
    )
    db.session.add(info)
    db.session.commit()
    return jsonify({"message": "Disease created", "disease": info.to_dict()}), 201


@admin_bp.route("/diseases/<int:disease_id>", methods=["GET"])
@require_admin
def get_disease(disease_id):
    info = DiseaseInfo.query.get(disease_id)
    if not info:
        return jsonify({"error": "Disease not found"}), 404
    return jsonify({"disease": info.to_dict()}), 200


@admin_bp.route("/diseases/<int:disease_id>", methods=["PUT"])
@require_admin
def update_disease(disease_id):
    info = DiseaseInfo.query.get(disease_id)
    if not info:
        return jsonify({"error": "Disease not found"}), 404

    data = request.get_json(silent=True) or {}
    for field in (
        "plant_name",
        "disease_name",
        "description",
        "treatment",
        "organic_treatment",
        "fertilizer",
        "prevention_tips",
        "symptoms",
    ):
        if field in data:
            value = data[field]
            setattr(info, field, value.strip() if isinstance(value, str) else value)

    db.session.commit()
    return jsonify({"message": "Disease updated", "disease": info.to_dict()}), 200


@admin_bp.route("/diseases/<int:disease_id>", methods=["DELETE"])
@require_admin
def delete_disease(disease_id):
    info = DiseaseInfo.query.get(disease_id)
    if not info:
        return jsonify({"error": "Disease not found"}), 404
    db.session.delete(info)
    db.session.commit()
    return jsonify({"message": "Disease deleted"}), 200
