from app import create_app, db
from app.models.user import User
import uuid

def create_admin_user():
    app = create_app()
    with app.app_context():
        # Check if admin already exists
        admin = User.query.filter_by(email='admin@example.com').first()
        if admin:
            print("Admin user already exists!")
            return

        # Create new admin user
        admin = User(
            id=str(uuid.uuid4()),
            email='admin@example.com',
            name='Admin User',
            is_active=True,
            is_admin=True,
            tags=['admin'],
            links={},
            team='Admin',
            available_days=['Mo', 'Tu', 'We', 'Th', 'Fr']
        )

        # Add to database
        db.session.add(admin)
        db.session.commit()
        print("Admin user created successfully!")

if __name__ == '__main__':
    create_admin_user() 