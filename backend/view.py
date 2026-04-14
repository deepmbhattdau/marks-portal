from database import SessionLocal
import models

db = SessionLocal()

print("\n--- STUDENTS ---")
students = db.query(models.Student).all()
for s in students:
    print(s.id, s.student_id, s.name, s.is_admin)

print("\n--- SUBJECTS ---")
subjects = db.query(models.Subject).all()
for sub in subjects:
    print(sub.id, sub.code, sub.name, sub.semester)

print("\n--- MARKS ---")
marks = db.query(models.Marks).all()
for m in marks:
    print(vars(m))