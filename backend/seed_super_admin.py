import os
from app import create_app, db
from models import User

def seed_super_admin():
    app = create_app()
    with app.app_context():
        email = 'admin@gmail.com'
        password = 'superAdmin'

        existing = User.query.filter_by(email=email).first()
        if existing:
            print("Super admin already exists:", email)
            return

        super_admin = User(
            first_name="Super",
            last_name="Admin",
            email=email,
            mobile="1234567890",  # you can set default or read from .env
            role="admin",
            is_verified=True,  # super admin always verified
            profile_pic=None   # can be updated later
        )
        super_admin.set_password(password)

        db.session.add(super_admin)
        db.session.commit()

        print("✅ Super admin created:", email)

if __name__ == "__main__":
    seed_super_admin()
