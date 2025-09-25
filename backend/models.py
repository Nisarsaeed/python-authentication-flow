from extensions import db, bcrypt
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    profile_pic = db.Column(db.String(255), nullable=True)  # store file path or URL
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    mobile = db.Column(db.String(15), nullable=False)
    role = db.Column(db.String(20), default="user") 
    is_verified = db.Column(db.Boolean, default=False)
    otp_code = db.Column(db.String(6), nullable=True)
    otp_expiry = db.Column(db.DateTime(timezone=True), nullable=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
