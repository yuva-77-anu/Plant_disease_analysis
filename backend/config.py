import os

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


def _parse_csv(value, default):
    if not value:
        return set(default)
    return {item.strip().lower() for item in value.split(",") if item.strip()}


def _parse_origins(value):
    if not value:
        return "*"
    origins = [item.strip() for item in value.split(",") if item.strip()]
    return origins if origins else "*"


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key-change-in-production"
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 60 * 60 * 24))
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = int(os.environ.get("DB_PORT", 3306))
    DB_USER = os.environ.get("DB_USER", "root")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
    DB_NAME = os.environ.get("DB_NAME", "plant_disease_db")

    DATABASE_URL = os.environ.get("DATABASE_URL")
    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        sqlite_path = os.environ.get("SQLITE_PATH", os.path.join(BASE_DIR, "plant_disease.db"))
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{sqlite_path}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {}

    UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", os.path.join(BASE_DIR, "uploads"))
    MAX_CONTENT_LENGTH = int(os.environ.get("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))
    ALLOWED_EXTENSIONS = _parse_csv(
        os.environ.get("ALLOWED_EXTENSIONS"),
        ["png", "jpg", "jpeg", "gif", "bmp", "webp"],
    )
    ALLOWED_MIME_TYPES = {
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/bmp",
        "image/webp",
    }

    _project_root = os.path.dirname(BASE_DIR)
    _ml_model_env = os.environ.get("ML_MODEL_PATH")
    if _ml_model_env and not os.path.isabs(_ml_model_env):
        ML_MODEL_PATH = os.path.abspath(os.path.join(_project_root, _ml_model_env))
    else:
        ML_MODEL_PATH = os.path.abspath(
            _ml_model_env or os.path.join(BASE_DIR, "..", "ml_model", "plant_disease_model.h5")
        )

    _label_map_env = os.environ.get("LABEL_MAP_PATH")
    if _label_map_env and not os.path.isabs(_label_map_env):
        LABEL_MAP_PATH = os.path.abspath(os.path.join(_project_root, _label_map_env))
    else:
        LABEL_MAP_PATH = os.path.abspath(
            _label_map_env or os.path.join(BASE_DIR, "..", "ml_model", "label_map.json")
        )

    FRONTEND_ORIGIN = _parse_origins(os.environ.get("FRONTEND_ORIGIN"))


config = Config()
