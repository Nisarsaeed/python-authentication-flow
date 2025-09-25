from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User
from flask import send_from_directory, current_app
import os

user_ns = Namespace("user", description="user operations")
#get user profile
@user_ns.route("/profile")
class UserProfile(Resource):
    @jwt_required()  # requires valid access token
    def get(self):
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)

        if not user:
            return {"msg": "User not found"}, 404

        return {
            "id": user.id,
            "first_name": user.first_name, 
            "last_name": user.last_name,
            "email": user.email,
            "mobile": user.mobile,
            "role": user.role,
            "profile_pic": user.profile_pic
        }, 200
    
@user_ns.route('/image/<filename>')
class ProfileImage(Resource):
    def get(self, filename):
        # ensure correct absolute path
        upload_folder = os.path.join(current_app.root_path, "uploads", "profile_images")
        
        # debug: check file existence
        file_path = os.path.join(upload_folder, filename)
        if not os.path.exists(file_path):
            return {"msg": f"File {filename} not found"}, 404

        return send_from_directory(upload_folder, filename)