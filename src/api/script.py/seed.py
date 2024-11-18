from api.models import db, User
from app import create_app
from werkzeug.security import generate_password_hash

# Create the Flask app context
app = create_app()

with app.app_context():
    # Drop all existing tables and recreate them
    db.drop_all()
    db.create_all()

    # Create test users
    user1 = User(
        email="basic_user@example.com",
        password=generate_password_hash("password"),
        plan="basic",
        role="user"
    )
    user2 = User(
        email="pro_user@example.com",
        password=generate_password_hash("password"),
        plan="pro",
        role="user"
    )
    admin_user = User(
        email="admin@example.com",
        password=generate_password_hash("password"),
        plan="enterprise",
        role="admin"
    )

    # Add users to the database
    db.session.add_all([user1, user2, admin_user])
    db.session.commit()

    print("Database seeded successfully!")
