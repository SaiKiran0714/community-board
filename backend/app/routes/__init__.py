from flask import Blueprint, jsonify, request, url_for
from app.models import User
from app import db, mail
from flask_mail import Message
import uuid
import jwt
import os
from datetime import datetime, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests

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
    try:
        # Try to get token from query parameters first
        token = request.args.get('token')
        email = request.args.get('email')
        
        # If not in query params, try Bearer token
        if not token:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    # Decode the token to get the user_id
                    payload = jwt.decode(
                        token,
                        os.getenv('SECRET_KEY', 'default-secret-key'),
                        algorithms=['HS256']
                    )
                    user = User.query.get(payload['user_id'])
                    if user:
                        return jsonify({
                            'isAdmin': user.is_admin,
                            'user': user.to_dict()
                        })
                    return jsonify({'error': 'User not found'}), 404
                except jwt.ExpiredSignatureError:
                    return jsonify({'error': 'Token has expired'}), 401
                except jwt.InvalidTokenError:
                    return jsonify({'error': 'Invalid token'}), 401
        
        # Handle email-based verification
        if token and email:
            user = User.query.filter_by(email=email).first()
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            try:
                if user.verify_token(token):
                    return jsonify({
                        'isAdmin': user.is_admin,
                        'user': user.to_dict()
                    })
                return jsonify({'error': 'Invalid or expired token'}), 401
            except Exception as e:
                print(f"Token verification error: {str(e)}")
                return jsonify({'error': 'Token verification failed'}), 401
        
        return jsonify({'error': 'Invalid or missing credentials'}), 401
        
    except Exception as e:
        print(f"Verification error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

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
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404

        data = request.json.get('data', [])
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # For non-admin users, limit the number of users they can import
        if not current_user.is_admin and len(data) > 10:
            return jsonify({'error': 'Non-admin users can only import up to 10 users at a time'}), 403

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
                    tags = [tag.strip() for tag in user_data['tags'].split(';') if tag.strip()]
                elif isinstance(user_data['tags'], list):
                    tags = [tag.strip() for tag in user_data['tags']]

            # For non-admin users, set some default values and restrictions
            is_admin = current_user.is_admin and user_data.get('is_admin', False)
            
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
                    is_active=True,
                    is_admin=is_admin
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

@api.route('/auth/google', methods=['POST'])
def google_auth():
    try:
        # Get the token from the request
        credential = request.json.get('credential')
        if not credential:
            return jsonify({'error': 'No credential provided'}), 400

        # Verify the token
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        idinfo = id_token.verify_oauth2_token(credential, requests.Request(), client_id)

        # Get user info from the token
        email = idinfo['email']
        name = idinfo.get('name', '')

        # Find or create user
        user = User.query.filter_by(email=email).first()
        if not user:
            # Create new user
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                name=name,
                is_active=True
            )
            db.session.add(user)
            db.session.commit()

        # Generate JWT token
        token = generate_token(user.id)
        
        return jsonify({
            'token': token,
            'user': user.to_dict()
        })

    except ValueError as e:
        # Invalid token
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500 

@api.route('/users/delete', methods=['POST'])
def delete_users():
    # Get the current user from the token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization required'}), 401
    
    try:
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, os.getenv('SECRET_KEY', 'default-secret-key'), algorithms=['HS256'])
        current_user = User.query.get(payload['user_id'])
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404

        # Get user IDs to delete from request
        user_ids = request.json.get('userIds', [])
        if not user_ids:
            return jsonify({'error': 'No user IDs provided'}), 400

        # For non-admin users, add safety checks
        if not current_user.is_admin:
            # Non-admin users can only delete themselves
            if len(user_ids) > 1 or current_user.id not in user_ids:
                return jsonify({'error': 'Unauthorized to delete other users'}), 403

        deleted_count = 0
        errors = []
        
        for user_id in user_ids:
            try:
                user = User.query.get(user_id)
                if user:
                    # Prevent deletion of admin users by non-admins
                    if user.is_admin and not current_user.is_admin:
                        errors.append(f'Cannot delete admin user: {user.email}')
                        continue
                    
                    db.session.delete(user)
                    deleted_count += 1
                else:
                    errors.append(f'User not found: {user_id}')
            except Exception as e:
                errors.append(f'Error deleting user {user_id}: {str(e)}')

        try:
            db.session.commit()
            return jsonify({
                'deleted': deleted_count,
                'errors': errors if errors else None
            }), 200 if not errors else 207
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'error': 'Database error while deleting users',
                'details': str(e)
            }), 500

    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 400 

@api.route('/users/<user_id>/toggle-admin', methods=['POST'])
def toggle_admin(user_id):
    # Only allow this in development environment
    if os.getenv('FLASK_ENV') != 'development':
        return jsonify({'error': 'This endpoint is only available in development mode'}), 403
    
    try:
        user = User.query.get_or_404(user_id)
        user.is_admin = not user.is_admin
        db.session.commit()
        return jsonify({
            'message': f'Admin status toggled. User is {"now" if user.is_admin else "no longer"} an admin',
            'isAdmin': user.is_admin
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 