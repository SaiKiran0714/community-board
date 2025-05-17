from flask import Blueprint, jsonify, request, url_for
from app.models import User
from app import db, mail
from flask_mail import Message
import uuid
import jwt
import os
from datetime import datetime, timedelta

api = Blueprint('api', __name__, url_prefix='/api')

# Add root route
@api.route('/')
def index():
    return jsonify({
        'status': 'ok',
        'message': 'Community Board API is running',
        'endpoints': {
            'auth': {
                'login': '/api/auth/login [POST]',
                'verify': '/api/auth/verify [GET]'
            },
            'users': {
                'list': '/api/users [GET]',
                'get': '/api/users/<user_id> [GET]',
                'update': '/api/users/<user_id> [PUT]',
                'import': '/api/users/import [POST]'
            }
        }
    })

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, os.getenv('SECRET_KEY', 'default-secret-key'), algorithm='HS256')

@api.route('/auth/login', methods=['POST'])
def login():
    email = request.json.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found. Please contact your administrator.'}), 404
    
    # Generate login token
    token = user.generate_login_token()
    db.session.commit()
    
    # Create login link
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    login_link = f"{frontend_url}/auth/verify?token={token}&email={email}"
    
    # In development, just return the link
    if os.getenv('FLASK_ENV') == 'development':
        return jsonify({
            'message': 'Development mode - use the link below to log in',
            'debug_link': login_link
        }), 200
    
    # In production, send email
    try:
        msg = Message(
            'Your Community Board Login Link',
            sender=os.getenv('MAIL_DEFAULT_SENDER'),
            recipients=[email]
        )
        msg.html = f"""
        <h2>Welcome to Community Board!</h2>
        <p>Click the link below to log in:</p>
        <p><a href="{login_link}">{login_link}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this login link, please ignore this email.</p>
        """
        mail.send(msg)
        return jsonify({'message': 'Login link sent successfully'}), 200
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'error': 'Failed to send login email. Please try again later.'}), 500

@api.route('/auth/verify', methods=['GET'])
def verify_login():
    token = request.args.get('token')
    email = request.args.get('email')
    
    if not token or not email:
        return jsonify({'error': 'Invalid login link'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.verify_token(token):
        return jsonify({
            'isAdmin': user.is_admin,
            'user': user.to_dict()
        })
    
    return jsonify({'error': 'Invalid or expired login link'}), 401

@api.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@api.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@api.route('/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    # Get the current user from the token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization required'}), 401
    
    try:
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, os.getenv('SECRET_KEY', 'default-secret-key'), algorithms=['HS256'])
        current_user = User.query.get(payload['user_id'])
        
        # Only allow users to edit their own profile unless they're an admin
        if not current_user.is_admin and current_user.id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        user = User.query.get_or_404(user_id)
        data = request.json
        
        # Update allowed fields
        allowed_fields = [
            'name', 'description', 'tags', 'is_active', 'links',
            'team', 'avatar_url', 'available_days'
        ]
        
        for field in allowed_fields:
            if field in data:
                # Convert camelCase to snake_case for some fields
                if field == 'is_active':
                    setattr(user, field, data.get('isActive'))
                elif field == 'available_days':
                    setattr(user, field, data.get('availableDays'))
                elif field == 'avatar_url':
                    setattr(user, field, data.get('avatarUrl'))
                else:
                    setattr(user, field, data.get(field))
        
        db.session.commit()
        return jsonify(user.to_dict())
    
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api.route('/users/import', methods=['POST'])
def import_users():
    # Get the current user from the token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization required'}), 401
    
    try:
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, os.getenv('SECRET_KEY', 'default-secret-key'), algorithms=['HS256'])
        current_user = User.query.get(payload['user_id'])
        
        # Check if user is admin
        if not current_user or not current_user.is_admin:
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403

        data = request.json.get('data', [])
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        new_users = []
        errors = []
        
        for idx, user_data in enumerate(data):
            # Validate required fields
            if not user_data.get('email'):
                errors.append(f'Row {idx + 1}: Email is required')
                continue
            if not user_data.get('name'):
                errors.append(f'Row {idx + 1}: Name is required')
                continue
                
            # Check if email already exists
            if User.query.filter_by(email=user_data.get('email')).first():
                errors.append(f'Row {idx + 1}: Email {user_data.get("email")} already exists')
                continue

            # Process tags
            tags = []
            if user_data.get('tags'):
                if isinstance(user_data['tags'], str):
                    tags = [tag.strip() for tag in user_data['tags'].split(',')]
                elif isinstance(user_data['tags'], list):
                    tags = [tag.strip() for tag in user_data['tags']]

            # Create new user
            try:
                user = User(
                    id=str(uuid.uuid4()),
                    email=user_data.get('email'),
                    name=user_data.get('name'),
                    description=user_data.get('description', ''),
                    tags=tags,
                    team=user_data.get('team', ''),
                    links=user_data.get('links', {}),
                    is_active=True
                )
                db.session.add(user)
                new_users.append(user)
            except Exception as e:
                errors.append(f'Row {idx + 1}: Failed to create user - {str(e)}')
                continue
        
        if new_users:
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                return jsonify({
                    'error': 'Database error while importing users',
                    'details': str(e)
                }), 500

        response = {
            'imported': len(new_users),
            'users': [user.to_dict() for user in new_users],
        }
        
        if errors:
            response['errors'] = errors
            return jsonify(response), 400 if not new_users else 207  # 207 Multi-Status

        return jsonify(response), 201

    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@api.route('/tags', methods=['GET'])
def get_tags():
    try:
        # Get all unique tags from all users
        users = User.query.all()
        all_tags = set()
        for user in users:
            if user.tags:
                all_tags.update(user.tags)
        return jsonify(sorted(list(all_tags)))
    except Exception as e:
        print(f"Error fetching tags: {str(e)}")
        return jsonify({'error': 'Failed to fetch tags'}), 500 