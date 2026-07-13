from database import SessionLocal, engine
import models
from auth import get_password_hash

ADMIN_LOGIN = "202511015@dau.ac.in"
ADMIN_PASSWORD = "12345"

print("Dropping all tables...")
models.Base.metadata.drop_all(bind=engine)

print("Creating fresh tables...")
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    admin = models.Student(
        student_id=ADMIN_LOGIN,
        name="Administrator",
        email=ADMIN_LOGIN,
        hashed_password=get_password_hash(ADMIN_PASSWORD),
        is_admin=True,
    )
    db.add(admin)
    db.commit()
finally:
    db.close()

print("Database reset complete!")
print(f"Admin login created: {ADMIN_LOGIN}")
