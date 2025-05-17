from app import db
import jwt
import os
from datetime import datetime, timedelta

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.String(36), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    tags = db.Column(db.JSON, default=list)
    links = db.Column(db.JSON, default=dict)
    team = db.Column(db.String(120), nullable=True)
    available_days = db.Column(db.JSON, default=list)
    avatar_url = db.Column(db.String(500), nullable=True)

    def generate_login_token(self):
        """Generate a login token for email authentication."""
        try:
            payload = {
                'user_id': self.id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }
            return jwt.encode(
                payload,
                os.getenv('SECRET_KEY', 'default-secret-key'),
                algorithm='HS256'
            )
        except Exception as e:
            print(f"Error generating token: {str(e)}")
            return None

    def verify_token(self, token):
        """Verify a login token."""
        try:
            # Verify JWT token
            payload = jwt.decode(
                token,
                os.getenv('SECRET_KEY', 'default-secret-key'),
                algorithms=['HS256']
            )
            
            # Check if the token belongs to this user
            if payload.get('user_id') != self.id:
                return False
            
            # Check if the token has expired
            exp = payload.get('exp')
            if not exp or datetime.utcnow().timestamp() > exp:
                return False
            
            return True

        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return False
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {str(e)}")
            return False
        except Exception as e:
            print(f"Token verification error: {str(e)}")
            return False

    def to_dict(self):
        """Convert user object to dictionary."""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'description': self.description,
            'isActive': self.is_active,
            'isAdmin': self.is_admin,
            'tags': self.tags or [],
            'links': self.links or {},
            'team': self.team,
            'availableDays': self.available_days or [],
            'avatarUrl': self.avatar_url
        } 