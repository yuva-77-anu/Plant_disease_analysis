import os
import sys


def _ensure_venv():
    """Re-exec under the project venv Python if Flask isn't importable."""
    try:
        import flask  # noqa: F401
        return
    except ImportError:
        pass

    here = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(here, "venv", "Scripts", "python.exe"),
        os.path.join(os.path.dirname(here), ".venv", "Scripts", "python.exe"),
    ]
    current = os.path.abspath(sys.executable)
    for cand in candidates:
        if os.path.exists(cand) and os.path.abspath(cand) != current:
            os.execv(cand, [cand] + sys.argv)
    # Already in the venv (or no venv found): let the real import error surface.


_ensure_venv()

# Ensure the project root is importable so ``from backend import ...`` works
# no matter which directory the script is launched from.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from backend import config
from backend.extensions import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(config.config)

    db.init_app(app)

    jwt = JWTManager(app)

    cors_origins = config.config.FRONTEND_ORIGIN
    if cors_origins == "*":
        CORS(app, supports_credentials=True)
    else:
        CORS(app, origins=cors_origins, supports_credentials=True)

    os.makedirs(config.config.UPLOAD_FOLDER, exist_ok=True)

    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        return jsonify({"error": "Missing or invalid Authorization header", "message": reason}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({"error": "Invalid token", "message": reason}), 422

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({"error": "Uploaded file is too large"}), 413

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "plant-disease-detection"}), 200

    @app.route("/uploads/<path:filename>", methods=["GET"])
    def serve_upload(filename):
        return send_from_directory(config.config.UPLOAD_FOLDER, filename)

    from backend.models import User, Prediction, DiseaseInfo  # noqa: F401
    from backend.routes.auth import auth_bp
    from backend.routes.predict import predict_bp
    from backend.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(predict_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/admin")

    _frontend_build = os.path.join(os.path.dirname(config.BASE_DIR), "frontend", "build")

    @app.route("/")
    def serve_frontend_index():
        if os.path.exists(os.path.join(_frontend_build, "index.html")):
            return send_from_directory(_frontend_build, "index.html")
        return jsonify({"message": "PlantGuard API is running. Frontend not built."}), 200

    @app.route("/<path:path>")
    def serve_frontend_static(path):
        if path.startswith("api/") or path.startswith("admin/") or path.startswith("uploads/") or path.startswith("health"):
            return not_found(None)
        full_path = os.path.join(_frontend_build, path)
        if path and os.path.isfile(full_path):
            return send_from_directory(_frontend_build, path)
        if os.path.exists(os.path.join(_frontend_build, "index.html")):
            return send_from_directory(_frontend_build, "index.html")
        return not_found(None)

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
