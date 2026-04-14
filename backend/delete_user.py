from database import SessionLocal
import models

db = SessionLocal()

student_id = "202511015"

user = db.query(models.Student).filter(models.Student.student_id == student_id).first()

if user:
    db.delete(user)
    db.commit()
    print("Deleted successfully")
else:
    print("User not found")

db.close()