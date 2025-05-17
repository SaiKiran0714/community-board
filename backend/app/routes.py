from flask import Blueprint, jsonify, request
from app.models import User
from app import db
import uuid

api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/')
def index():
    return jsonify({
        'status': 'ok',
        'message': 'Community Board API is running',
        'endpoints': {
            'users': {
                'list': '/api/users [GET]',
                'get': '/api/users/<user_id> [GET]',
                'update': '/api/users/<user_id> [PUT]',
                'import': '/api/users/import [POST]'
            }
        }
    })

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
    
    try:
        db.session.commit()
        return jsonify(user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api.route('/users/import', methods=['POST'])
def import_users():
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