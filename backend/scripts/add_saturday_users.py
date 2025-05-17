from app import create_app, db
from app.models.user import User
import uuid

def add_saturday_users():
    app = create_app()
    with app.app_context():
        # Users with Saturday availability
        saturday_users = [
            {
                'id': str(uuid.uuid4()),
                'email': 'weekend.dev@example.com',
                'name': 'Sarah Weekend',
                'description': 'Full-stack developer who prefers weekend work',
                'tags': ['react', 'node.js', 'weekend-warrior', 'remote'],
                'team': 'Full Stack',
                'available_days': ['saturday'],
                'links': {'github': 'https://github.com/sarahw', 'linkedin': 'https://linkedin.com/in/sarahw'},
                'is_active': True
            },
            {
                'id': str(uuid.uuid4()),
                'email': 'flexible.time@example.com',
                'name': 'Alex Flexible',
                'description': 'UI/UX designer with flexible schedule',
                'tags': ['ui', 'ux', 'figma', 'design-systems', 'flexible'],
                'team': 'Design',
                'available_days': ['friday', 'saturday'],
                'links': {'github': 'https://github.com/alexf', 'portfolio': 'https://alexf.design'},
                'is_active': True
            },
            {
                'id': str(uuid.uuid4()),
                'email': 'night.owl@example.com',
                'name': 'Oliver Night',
                'description': 'Backend developer who loves working weekends',
                'tags': ['python', 'django', 'postgresql', 'night-shift'],
                'team': 'Backend',
                'available_days': ['saturday'],
                'links': {'github': 'https://github.com/olivern', 'linkedin': 'https://linkedin.com/in/olivern'},
                'is_active': True
            }
        ]

        for user_data in saturday_users:
            # Check if user already exists
            existing_user = User.query.filter_by(email=user_data['email']).first()
            if not existing_user:
                user = User(**user_data)
                db.session.add(user)
                print(f"Adding user: {user_data['name']}")
            else:
                print(f"User already exists: {user_data['name']}")

        try:
            db.session.commit()
            print("Successfully added Saturday users!")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding users: {str(e)}")

if __name__ == '__main__':
    add_saturday_users() 