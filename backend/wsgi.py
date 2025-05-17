import os
from app import create_app

# Get the environment from system variable, default to production
env = os.getenv('FLASK_ENV', 'production')
app = create_app() 