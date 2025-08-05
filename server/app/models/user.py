from app import db
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import UUID

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=True)
    first_name = db.Column(db.String(255), nullable=True)
    last_name = db.Column(db.String(255), nullable=True)
    profile_image_url = db.Column(db.String(500), nullable=True)
    role = db.Column(db.String(50), nullable=False, default='retailer')
    business_name = db.Column(db.Text, nullable=True)
    address = db.Column(db.Text, nullable=True)
    phone_number = db.Column(db.String(50), nullable=True)
    whatsapp_number = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Password field (not stored in database, only for registration)
    _password = None
    
    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        if kwargs.get('password'):
            self.set_password(kwargs['password'])
    
    def set_password(self, password):
        """Set password hash"""
        self._password = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password hash"""
        return check_password_hash(self._password, password)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'email': self.email,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'role': self.role,
            'businessName': self.business_name,
            'address': self.address,
            'phoneNumber': self.phone_number,
            'whatsappNumber': self.whatsapp_number,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_public_dict(self):
        """Convert to public dictionary (without sensitive info)"""
        return {
            'id': str(self.id),
            'firstName': self.first_name,
            'lastName': self.last_name,
            'role': self.role,
            'businessName': self.business_name,
            'address': self.address,
            'phoneNumber': self.phone_number,
            'whatsappNumber': self.whatsapp_number
        }
    
    @property
    def full_name(self):
        """Get full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.business_name:
            return self.business_name
        else:
            return self.email or "Unknown User"
    
    def __repr__(self):
        return f'<User {self.email}>' 