"""
Run this once to create your first admin user.
Usage: python3 create_admin.py
"""
from database import SessionLocal, engine
import models
from auth import get_password_hash

models.Base.metadata.create_all(bind=engine)

def create_admin():
    db = SessionLocal()
    print("=== Create Admin User ===")
    student_id = input("Enter admin ID (e.g. 'admin'): ").strip()
    name = input("Enter admin name: ").strip()
    password = input("Enter admin password: ").strip()

    existing = db.query(models.Student).filter(models.Student.student_id == student_id).first()
    if existing:
        print(f"A user with ID '{student_id}' already exists.")
        db.close()
        return

    admin = models.Student(
        student_id=student_id,
        name=name,
        hashed_password=get_password_hash(password),
        is_admin=True,
    )
    db.add(admin)
    db.commit()
    db.close()
    print(f"\n✓ Admin '{student_id}' created successfully!")
    print("You can now log in at your app URL with these credentials.")

if __name__ == "__main__":
    create_admin()
