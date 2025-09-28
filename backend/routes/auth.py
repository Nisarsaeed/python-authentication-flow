import os
import random
from flask import request, current_app, jsonify, make_response 
from werkzeug.utils import secure_filename
from flask_restx import Namespace, Resource
from extensions import db
from extensions import mail
from flask_mail import Message
from models import User
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token, create_refresh_token, set_access_cookies, set_refresh_cookies, unset_jwt_cookies, get_jwt_identity, jwt_required, get_jwt
import uuid

auth_ns = Namespace("auth", description="Authentication operations")

@auth_ns.route("/register")
class Register(Resource):
    def post(self):
        # Using form-data (not JSON, since we include a file)
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        email = request.form.get("email")
        password = request.form.get("password")
        mobile = request.form.get("mobile")
        profile_pic = request.files.get("profile_pic")

        if not (first_name and last_name and email and password and mobile):
            return {"message": "All fields are required"}, 400

        if User.query.filter_by(email=email).first():
            return {"message": "Email already registered"}, 400

        filename = None
        if profile_pic and profile_pic.filename:
            filename = secure_filename(profile_pic.filename)
            # Add timestamp or UUID to avoid filename conflicts
            file_extension = os.path.splitext(filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{file_extension}"
            filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_filename)
            profile_pic.save(filepath)
            filename = unique_filename  # Store the unique filename in database
        
        new_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            mobile=mobile,
            profile_pic=filename
        )
        new_user.set_password(password)
    
        otp = str(random.randint(100000, 999999))
        expiry = datetime.now(timezone.utc) + timedelta(minutes=5)
        new_user.otp_code = otp
        new_user.otp_expiry = expiry

        db.session.add(new_user)
        db.session.commit()

        # Send email
        msg = Message(
            subject="Your OTP Code",
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[email],
            body=f"Your OTP code is {otp}. It will expire in 5 minutes."
        )
        mail.send(msg)

        return {"message": "User registered successfully. Please check your email for OTP."}, 201

@auth_ns.route("/verify-otp")
class VerifyOTP(Resource):
    def post(self):
        data = request.get_json()
        email = data.get("email")
        otp = data.get("otp")

        user = User.query.filter_by(email=email).first()
        if not user:
            return {"message": "User not found"}, 404
        if user.is_verified:
            return {"message": "User already verified"}, 400
        if user.otp_code != otp:
            return {"message": "Invalid OTP"}, 400
        print('cannot compare ', datetime.now(timezone.utc).replace(tzinfo=None), user.otp_expiry)
        if datetime.now(timezone.utc).replace(tzinfo=None)  > user.otp_expiry:
            return {"message": "OTP expired"}, 400

        user.is_verified = True
        user.otp_code = None
        user.otp_expiry = None
        db.session.commit()

        return {"message": "User verified successfully"}, 200


@auth_ns.route("/login")
class Login(Resource):
    def post(self): 
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return make_response(jsonify({"msg": "Invalid credentials"}), 400)
        
        if not user.is_verified:
            return make_response(jsonify({"msg": "Account not verified"}), 400)
        
        access_token = create_access_token(identity=str(user.id),additional_claims={"role": user.role}, fresh=True)
        refresh_token = create_refresh_token(identity=str(user.id),additional_claims={"role": user.role})

        resp = make_response(jsonify({"msg": "Login successful"}), 200)
        set_access_cookies(resp, access_token)
        set_refresh_cookies(resp, refresh_token)
        return resp

@auth_ns.route("/refresh-token")
class RefreshToken(Resource):
    method_decorators = [jwt_required(refresh=True)]
    def post(self):
        # identity from the validated refresh token
        identity = get_jwt_identity()

        # read claims from the refresh token (so we can preserve 'role' claim)
        claims = get_jwt()  # returns dict of token claims
        role_claim = claims.get("role")

        additional_claims = {"role": role_claim} if role_claim else None

        new_access_token = create_access_token(
            identity=identity,
            additional_claims=additional_claims or {},
            fresh=False
        )

        resp = make_response(jsonify({"msg": "Token refreshed"}), 200)
        # overwrite the access token cookie
        set_access_cookies(resp, new_access_token)
        return resp

@auth_ns.route("/logout")
class Logout(Resource):
    def post(self):
        resp = make_response(jsonify({"msg": "Logged out"}), 200)
        unset_jwt_cookies(resp)   # clears both access + refresh cookies
        return resp
