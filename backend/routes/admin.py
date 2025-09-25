import os
from flask import request, jsonify, current_app
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User
from utils.auth_decorators import role_required
from werkzeug.utils import secure_filename
import uuid

admin_ns = Namespace("admin", description="Super Admin operations")

# 📌 View all users
@admin_ns.route("/users")
class UserList(Resource):
    method_decorators = [role_required("admin")]
    def get(self):
        users = User.query.filter(User.role != "admin").all()
        users_data = [
            {
                "id": u.id,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "email": u.email,
                "mobile": u.mobile,
                "role": u.role,
                "profile_pic": u.profile_pic,
            }
            for u in users
        ]
        return jsonify(users_data)

    def post(self):
        # Get form data and files
        data = request.form.to_dict()  # Get form fields
        profile_pic = request.files.get('profile_picture')  # Get uploaded file
        print(data)
        
        # Check if user already exists
        if User.query.filter_by(email=data["email"]).first():
            return {"msg": "User already exists"}, 400
        
        # Handle profile picture upload
        filename = None
        if profile_pic and profile_pic.filename:
            filename = secure_filename(profile_pic.filename)
            # Add timestamp or UUID to avoid filename conflicts
            file_extension = os.path.splitext(filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{file_extension}"
            filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_filename)
            profile_pic.save(filepath)
            filename = unique_filename  # Store the unique filename in database
        
        # Create user with profile picture filename
        user = User(
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            email=data["email"],
            mobile=data.get("mobile"),
            profile_pic=filename,  # Store filename in database
            role="user",  # default role
            is_verified=True,  # ✅ bypass OTP for super admin–created users
            otp_code=None,
            otp_expiry=None,
        )
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()
        return {"msg": "User created successfully"}, 201

# 📌 Update a user
@admin_ns.route("/users/<int:user_id>")
class UserDetail(Resource):
    method_decorators = [role_required("admin")]
    def put(self, user_id):
        user = User.query.get_or_404(user_id)
        data = request.get_json()

        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.mobile = data.get("mobile", user.mobile)
        user.role = data.get("role", user.role)

        db.session.commit()
        return {"msg": "User updated successfully"}

    def delete(self, user_id):
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return {"msg": "User deleted successfully"}

