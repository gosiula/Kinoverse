import jwt
import bcrypt
from datetime import datetime, timedelta
import bcrypt

SECRET_KEY = "tajny_klucz"
TOKEN_EXPIRATION_MINUTES = 1440

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_jwt_token(user_id, role, mail):
    expiration = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRATION_MINUTES)
    payload = {
        "user_id": user_id,
        "role": role,
        "mail": mail,
        "exp": expiration
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def decode_jwt_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise ValueError("Token wygasł")
    except jwt.InvalidTokenError:
        raise ValueError("Nieprawidłowy token")