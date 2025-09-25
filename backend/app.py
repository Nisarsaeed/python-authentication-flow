import os
from flask import Flask
from flask_restx import Api
from extensions import db, bcrypt, jwt, mail
from routes.auth import auth_ns 
from routes.admin import admin_ns
from routes.user import user_ns
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask import send_from_directory

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    # Config
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # change later
    app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), "uploads/profile_images")
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
      # Flask-Mail config
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")   # set in .env
    app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")   # Gmail App Password
    app.config["JWT_SECRET_KEY"] = "super-secret-key"  # change in production
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["JWT_COOKIE_SECURE"] = False  # True in production with HTTPS
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False  # keep False until you setup CSRF

    # Init extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    api = Api(app, version="1.0", title="Galvan AI API", doc="/docs")
    api.add_namespace(auth_ns)
    api.add_namespace(admin_ns)
    api.add_namespace(user_ns)

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
