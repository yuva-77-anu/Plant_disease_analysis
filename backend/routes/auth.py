import re

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)

from backend.extensions import db
from backend.models import User
from backend.config import config

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_RE = re.compile(r"^[A-Za-z0-9_.-]{3,40}$")


def _validate_registration(data):
    errors = {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username:
        errors["username"] = "Username is required"
    elif not USERNAME_RE.match(username):
        errors["username"] = "Username must be 3-40 chars (letters, numbers, _ . -)"

    if not email:
        errors["email"] = "Email is required"
    elif not EMAIL_RE.match(email):
        errors["email"] = "Invalid email format"

    if not password:
        errors["password"] = "Password is required"
    elif len(password) < 6:
        errors["password"] = "Password must be at least 6 characters"

    return username, email, password, errors


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username, email, password, errors = _validate_registration(data)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(username=username, email=email)
    user.set_password(password)
    user.is_admin = bool(data.get("is_admin", False))
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return (
        jsonify(
            {
                "message": "Registration successful",
                "access_token": token,
                "user": user.to_dict(),
            }
        ),
        201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    identifier = (data.get("username") or data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"error": "Username/email and password are required"}), 400

    user = User.query.filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return (
        jsonify(
            {
                "message": "Login successful",
                "access_token": token,
                "user": user.to_dict(),
            }
        ),
        200,
    )


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if email and email != user.email:
        if not EMAIL_RE.match(email):
            return jsonify({"error": "Invalid email format"}), 400
        if User.query.filter(User.email == email, User.id != user.id).first():
            return jsonify({"error": "Email already in use"}), 409
        user.email = email

    if password:
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        user.set_password(password)

    db.session.commit()
    return jsonify({"message": "Profile updated", "user": user.to_dict()}), 200
