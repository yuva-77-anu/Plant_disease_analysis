from datetime import datetime, timezone

from werkzeug.security import generate_password_hash, check_password_hash
from backend.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    predictions = db.relationship(
        "Prediction", backref="user", lazy="dynamic", cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_email=True):
        data = {
            "id": self.id,
            "username": self.username,
            "is_admin": self.is_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_email:
            data["email"] = self.email
        return data

    def __repr__(self):
        return f"<User {self.username}>"


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    plant_name = db.Column(db.String(100), nullable=False)
    disease_name = db.Column(db.String(150), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    treatment = db.Column(db.Text, nullable=True)
    organic_treatment = db.Column(db.Text, nullable=True)
    fertilizer = db.Column(db.Text, nullable=True)
    prevention_tips = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "plant_name": self.plant_name,
            "disease_name": self.disease_name,
            "confidence": self.confidence,
            "image_path": self.image_path,
            "description": self.description,
            "treatment": self.treatment,
            "organic_treatment": self.organic_treatment,
            "fertilizer": self.fertilizer,
            "prevention_tips": self.prevention_tips,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Prediction {self.plant_name}:{self.disease_name}>"


class DiseaseInfo(db.Model):
    __tablename__ = "disease_info"

    id = db.Column(db.Integer, primary_key=True)
    plant_name = db.Column(db.String(100), nullable=False, index=True)
    disease_name = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    treatment = db.Column(db.Text, nullable=True)
    organic_treatment = db.Column(db.Text, nullable=True)
    fertilizer = db.Column(db.Text, nullable=True)
    prevention_tips = db.Column(db.Text, nullable=True)
    symptoms = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "plant_name": self.plant_name,
            "disease_name": self.disease_name,
            "description": self.description,
            "treatment": self.treatment,
            "organic_treatment": self.organic_treatment,
            "fertilizer": self.fertilizer,
            "prevention_tips": self.prevention_tips,
            "symptoms": self.symptoms,
        }

    def __repr__(self):
        return f"<DiseaseInfo {self.plant_name}:{self.disease_name}>"
