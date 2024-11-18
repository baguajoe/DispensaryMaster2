from functools import wraps
from flask_jwt_extended import get_jwt_identity

def plan_required(required_plans):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if user.plan not in required_plans:
                return {"error": "This feature is not available for your subscription level."}, 403
            return f(*args, **kwargs)
        return wrapper
    return decorator
