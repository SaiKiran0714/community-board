from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail
from flask_migrate import Migrate
from dotenv import load_dotenv
import os
import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
mail = Mail()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Configure the Flask application
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///community.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configure email settings
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
    
    # For development, only disable email if explicitly set
    app.config['MAIL_SUPPRESS_SEND'] = os.getenv('MAIL_SUPPRESS_SEND', 'False').lower() == 'true'
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    
    # Register blueprints
    from .routes import api
    app.register_blueprint(api)
    
    with app.app_context():
        logger.info("Creating database tables...")
        # Create tables
        db.create_all()
        
        # Check if we need to initialize sample data
        from .models.user import User
        user_count = User.query.count()
        logger.info(f"Current user count: {user_count}")
        
        if user_count == 0:
            logger.info("Initializing sample users...")
            # Create sample users
            sample_users = [
                {
                    'id': str(uuid.uuid4()),
                    'email': 'admin@example.com',
                    'name': 'Admin User',
                    'description': 'System administrator with full access',
                    'is_admin': True,
                    'tags': ['admin', 'tech', 'management'],
                    'team': 'IT',
                    'available_days': ['monday', 'wednesday', 'friday'],
                    'links': {'github': 'https://github.com/admin', 'linkedin': 'https://linkedin.com/in/admin'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'emily.chen@example.com',
                    'name': 'Emily Chen',
                    'description': 'Full-stack developer with expertise in MERN stack',
                    'tags': ['frontend', 'backend', 'react', 'node.js', 'mongodb'],
                    'team': 'Full Stack',
                    'available_days': ['tuesday', 'thursday'],
                    'links': {'github': 'https://github.com/emilychen', 'portfolio': 'https://emilychen.dev'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'marcus.rodriguez@example.com',
                    'name': 'Marcus Rodriguez',
                    'description': 'AI/ML engineer specializing in computer vision',
                    'tags': ['python', 'tensorflow', 'opencv', 'machine-learning'],
                    'team': 'AI',
                    'available_days': ['monday', 'wednesday', 'friday'],
                    'links': {'github': 'https://github.com/marcusai', 'research': 'https://scholar.google.com/marcus'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'sophia.patel@example.com',
                    'name': 'Sophia Patel',
                    'description': 'Product designer with focus on accessibility',
                    'tags': ['ui', 'ux', 'accessibility', 'figma', 'sketch'],
                    'team': 'Design',
                    'available_days': ['tuesday', 'thursday'],
                    'links': {'portfolio': 'https://sophiadesigns.com', 'dribbble': 'https://dribbble.com/sophia'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'liam.thompson@example.com',
                    'name': 'Liam Thompson',
                    'description': 'Cloud architect with multi-cloud expertise',
                    'tags': ['aws', 'azure', 'gcp', 'terraform', 'kubernetes'],
                    'team': 'DevOps',
                    'available_days': ['wednesday', 'friday'],
                    'links': {'github': 'https://github.com/liamcloud', 'blog': 'https://cloudwithLiam.com'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'aisha.khan@example.com',
                    'name': 'Aisha Khan',
                    'description': 'Mobile app developer specializing in Flutter',
                    'tags': ['flutter', 'dart', 'mobile', 'firebase'],
                    'team': 'Mobile',
                    'available_days': ['monday', 'thursday'],
                    'links': {'github': 'https://github.com/aishak', 'playstore': 'https://play.google.com/aisha'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'david.kim@example.com',
                    'name': 'David Kim',
                    'description': 'Security engineer focused on application security',
                    'tags': ['security', 'pentesting', 'oauth', 'cryptography'],
                    'team': 'Security',
                    'available_days': ['tuesday', 'friday'],
                    'links': {'github': 'https://github.com/secureDavid', 'blog': 'https://securitywithDavid.com'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'nina.silva@example.com',
                    'name': 'Nina Silva',
                    'description': 'Data scientist specializing in NLP',
                    'tags': ['python', 'nlp', 'machine-learning', 'spacy'],
                    'team': 'Data Science',
                    'available_days': ['monday', 'wednesday'],
                    'links': {'github': 'https://github.com/ninasilva', 'kaggle': 'https://kaggle.com/nina'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'alex.foster@example.com',
                    'name': 'Alex Foster',
                    'description': 'Game developer with Unity expertise',
                    'tags': ['unity', 'c#', 'game-dev', '3d-modeling'],
                    'team': 'Gaming',
                    'available_days': ['thursday', 'friday'],
                    'links': {'github': 'https://github.com/alexgames', 'itch': 'https://itch.io/alex'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'maya.wong@example.com',
                    'name': 'Maya Wong',
                    'description': 'Technical writer and documentation specialist',
                    'tags': ['documentation', 'technical-writing', 'markdown'],
                    'team': 'Documentation',
                    'available_days': ['tuesday', 'wednesday'],
                    'links': {'portfolio': 'https://mayawrites.com', 'medium': 'https://medium.com/@maya'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'carlos.garcia@example.com',
                    'name': 'Carlos Garcia',
                    'description': 'Backend developer specializing in microservices',
                    'tags': ['java', 'spring-boot', 'microservices', 'kafka'],
                    'team': 'Backend',
                    'available_days': ['monday', 'friday'],
                    'links': {'github': 'https://github.com/carlosg', 'linkedin': 'https://linkedin.com/in/carlosgarcia'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'rachel.green@example.com',
                    'name': 'Rachel Green',
                    'description': 'Frontend developer focused on web accessibility',
                    'tags': ['react', 'typescript', 'accessibility', 'sass'],
                    'team': 'Frontend',
                    'available_days': ['wednesday', 'thursday'],
                    'links': {'github': 'https://github.com/rachelg', 'codepen': 'https://codepen.io/rachel'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'thomas.mueller@example.com',
                    'name': 'Thomas Mueller',
                    'description': 'Blockchain developer and smart contract expert',
                    'tags': ['blockchain', 'solidity', 'ethereum', 'web3'],
                    'team': 'Blockchain',
                    'available_days': ['tuesday', 'friday'],
                    'links': {'github': 'https://github.com/thomasblockchain', 'medium': 'https://medium.com/@thomas'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'priya.sharma@example.com',
                    'name': 'Priya Sharma',
                    'description': 'Quality assurance engineer specializing in automation',
                    'tags': ['selenium', 'cypress', 'testing', 'automation'],
                    'team': 'QA',
                    'available_days': ['monday', 'wednesday'],
                    'links': {'github': 'https://github.com/priyaqa', 'linkedin': 'https://linkedin.com/in/priyasharma'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'james.wilson@example.com',
                    'name': 'James Wilson',
                    'description': 'DevOps engineer focusing on CI/CD pipelines',
                    'tags': ['jenkins', 'gitlab-ci', 'docker', 'ansible'],
                    'team': 'DevOps',
                    'available_days': ['tuesday', 'thursday'],
                    'links': {'github': 'https://github.com/jamesops', 'blog': 'https://devopswithJames.com'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'emma.brown@example.com',
                    'name': 'Emma Brown',
                    'description': 'UX researcher with focus on user testing',
                    'tags': ['user-research', 'usability-testing', 'analytics'],
                    'team': 'Design',
                    'available_days': ['wednesday', 'friday'],
                    'links': {'portfolio': 'https://emmaux.design', 'medium': 'https://medium.com/@emma'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'ryan.zhang@example.com',
                    'name': 'Ryan Zhang',
                    'description': 'Systems architect specializing in distributed systems',
                    'tags': ['architecture', 'distributed-systems', 'scalability'],
                    'team': 'Architecture',
                    'available_days': ['monday', 'thursday'],
                    'links': {'github': 'https://github.com/ryanarch', 'blog': 'https://systemswithRyan.com'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'lisa.anderson@example.com',
                    'name': 'Lisa Anderson',
                    'description': 'Content strategist and technical copywriter',
                    'tags': ['content-strategy', 'copywriting', 'seo'],
                    'team': 'Content',
                    'available_days': ['tuesday', 'friday'],
                    'links': {'portfolio': 'https://lisawrites.com', 'twitter': 'https://twitter.com/lisatech'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'michael.lee@example.com',
                    'name': 'Michael Lee',
                    'description': 'Database administrator and performance tuning expert',
                    'tags': ['postgresql', 'mysql', 'mongodb', 'optimization'],
                    'team': 'Database',
                    'available_days': ['monday', 'wednesday'],
                    'links': {'github': 'https://github.com/michaeldb', 'blog': 'https://dbwithMichael.com'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'sarah.miller@example.com',
                    'name': 'Sarah Miller',
                    'description': 'AR/VR developer specializing in Unity',
                    'tags': ['unity', 'ar', 'vr', 'c#'],
                    'team': 'AR/VR',
                    'available_days': ['thursday', 'friday'],
                    'links': {'github': 'https://github.com/sarahvr', 'portfolio': 'https://sarahvr.tech'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'daniel.taylor@example.com',
                    'name': 'Daniel Taylor',
                    'description': 'IoT specialist and embedded systems developer',
                    'tags': ['iot', 'embedded', 'raspberry-pi', 'arduino'],
                    'team': 'IoT',
                    'available_days': ['tuesday', 'wednesday'],
                    'links': {'github': 'https://github.com/danieliot', 'hackaday': 'https://hackaday.io/daniel'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'olivia.martin@example.com',
                    'name': 'Olivia Martin',
                    'description': 'Performance engineer focusing on web optimization',
                    'tags': ['performance', 'optimization', 'webpack', 'lighthouse'],
                    'team': 'Performance',
                    'available_days': ['monday', 'friday'],
                    'links': {'github': 'https://github.com/oliviaperf', 'blog': 'https://perfwithOlivia.com'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'kevin.nguyen@example.com',
                    'name': 'Kevin Nguyen',
                    'description': 'Mobile game developer with Unity and Unreal expertise',
                    'tags': ['unity', 'unreal-engine', 'mobile-gaming', 'c++'],
                    'team': 'Gaming',
                    'available_days': ['wednesday', 'thursday'],
                    'links': {'github': 'https://github.com/kevingames', 'portfolio': 'https://kevingames.dev'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'anna.kowalski@example.com',
                    'name': 'Anna Kowalski',
                    'description': 'Data engineer specializing in big data technologies',
                    'tags': ['apache-spark', 'hadoop', 'python', 'scala'],
                    'team': 'Data',
                    'available_days': ['tuesday', 'friday'],
                    'links': {'github': 'https://github.com/annadata', 'linkedin': 'https://linkedin.com/in/annakowalski'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'chris.baker@example.com',
                    'name': 'Chris Baker',
                    'description': 'Release manager and deployment specialist',
                    'tags': ['deployment', 'release-management', 'jenkins', 'gitops'],
                    'team': 'DevOps',
                    'available_days': ['monday', 'wednesday'],
                    'links': {'github': 'https://github.com/chrisops', 'blog': 'https://releaseswithChris.com'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'jessica.white@example.com',
                    'name': 'Jessica White',
                    'description': 'Accessibility specialist and frontend developer',
                    'tags': ['accessibility', 'wcag', 'react', 'aria'],
                    'team': 'Frontend',
                    'available_days': ['tuesday', 'thursday'],
                    'links': {'github': 'https://github.com/jessicaa11y', 'blog': 'https://a11ywithJessica.com'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'mohammed.ali@example.com',
                    'name': 'Mohammed Ali',
                    'description': 'Cloud security architect and compliance expert',
                    'tags': ['security', 'aws', 'compliance', 'identity'],
                    'team': 'Security',
                    'available_days': ['wednesday', 'friday'],
                    'links': {'github': 'https://github.com/mohammedsec', 'blog': 'https://cloudsecuritywithMo.com'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'sofia.lopez@example.com',
                    'name': 'Sofia Lopez',
                    'description': 'API designer and integration specialist',
                    'tags': ['api-design', 'rest', 'graphql', 'swagger'],
                    'team': 'Backend',
                    'available_days': ['monday', 'thursday'],
                    'links': {'github': 'https://github.com/sofiaapi', 'blog': 'https://apiswithSofia.com'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'william.clark@example.com',
                    'name': 'William Clark',
                    'description': 'Build and automation engineer',
                    'tags': ['ci-cd', 'automation', 'gradle', 'maven'],
                    'team': 'DevOps',
                    'available_days': ['tuesday', 'friday'],
                    'links': {'github': 'https://github.com/willbuild', 'gitlab': 'https://gitlab.com/willclark'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'elena.popov@example.com',
                    'name': 'Elena Popov',
                    'description': 'Machine learning engineer specializing in recommendation systems',
                    'tags': ['machine-learning', 'python', 'recommendation-systems', 'pytorch'],
                    'team': 'AI',
                    'available_days': ['monday', 'wednesday'],
                    'links': {'github': 'https://github.com/elenaml', 'research': 'https://scholar.google.com/elena'}
                },
                {
                    'id': str(uuid.uuid4()),
                    'email': 'lucas.santos@example.com',
                    'name': 'Lucas Santos',
                    'description': 'Quantum computing researcher and developer',
                    'tags': ['quantum-computing', 'qiskit', 'python', 'physics'],
                    'team': 'Research',
                    'available_days': ['thursday', 'friday'],
                    'links': {'github': 'https://github.com/lucasquantum', 'research': 'https://quantum.lab/lucas'}
                }
            ]
            
            # Add all sample users
            for user_data in sample_users:
                user = User(**user_data)
                db.session.add(user)
                logger.info(f"Added user: {user_data['name']}")
            
            # Commit the changes
            try:
                db.session.commit()
                logger.info("Successfully committed all sample users to database")
            except Exception as e:
                logger.error(f"Error committing users to database: {str(e)}")
                db.session.rollback()
    
    return app 