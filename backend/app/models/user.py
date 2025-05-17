from app import db

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