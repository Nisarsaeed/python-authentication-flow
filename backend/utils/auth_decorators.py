# utils/auth_decorators.py
from functools import wraps
from flask import jsonify, make_response
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def role_required(required_role):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # verifies token (will raise if missing/invalid)
            try:
                verify_jwt_in_request()
            except Exception:
                return make_response(jsonify({"msg": "Missing or invalid token"}), 401)

            claims = get_jwt()
            if claims.get("role") != required_role:
                return make_response(jsonify({"msg": "Access forbidden: insufficient role"}), 403)

            return fn(*args, **kwargs)
        return decorator
    return wrapper
