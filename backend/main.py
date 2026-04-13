from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import models, auth
from database import get_db, engine
import pandas as pd
import io

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Marks Portal API")

# ─── Update this after deploying to Netlify ───────────────────────────────────
FRONTEND_URL = "https://your-app.netlify.app"

app.add_middleware(
    CORSMiddleware,
    #FRONTEND_URL, "http://localhost:5173"
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Auth ─────────────────────────────────────────────────────────────────────

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = db.query(models.Student).filter(
        models.Student.student_id == form_data.username
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    try:
        valid = auth.verify_password(form_data.password, user.hashed_password)
    except Exception as e:
        print("VERIFY ERROR:", e)
        raise HTTPException(status_code=500, detail="Password verification failed")

    if not valid:
        raise HTTPException(status_code=401, detail="Invalid password")

    token = auth.create_access_token({
        "sub": user.student_id,
        "is_admin": user.is_admin
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "is_admin": user.is_admin
    }

# ─── Student Routes ───────────────────────────────────────────────────────────

@app.get("/me")
def get_me(current_user: models.Student = Depends(auth.get_current_user)):
    return {
        "student_id": current_user.student_id,
        "name": current_user.name,
        "division": current_user.division,
        "is_admin": current_user.is_admin,
    }

@app.get("/marks")
def get_my_marks(
    current_user: models.Student = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    marks_list = (
        db.query(models.Marks, models.Subject)
        .join(models.Subject, models.Marks.subject_id == models.Subject.id)
        .filter(models.Marks.student_id == current_user.id)
        .all()
    )
    result = []
    for m, s in marks_list:
        result.append({
            "subject_code": s.code,
            "subject_name": s.name,
            "semester": s.semester,
            "insem1": m.insem1,
            "insem2": m.insem2,
            "insem3": m.insem3,
            "practical": m.practical,
            "assignment": m.assignment,
            "endsem": m.endsem,
        })
    return result

# ─── Admin Routes ─────────────────────────────────────────────────────────────

class StudentCreate(BaseModel):
    student_id: str
    name: str
    password: str
    email: Optional[str] = None
    division: Optional[str] = None


class MarksUpdate(BaseModel):
    student_id: str
    subject_code: str
    insem1: Optional[float] = None
    insem2: Optional[float] = None
    insem3: Optional[float] = None
    practical: Optional[float] = None
    assignment: Optional[float] = None
    endsem: Optional[float] = None


@app.post("/admin/students")
def create_student(
    data: StudentCreate,
    admin=Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Student).filter(models.Student.student_id == data.student_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    student = models.Student(
        student_id=data.student_id,
        name=data.name,
        hashed_password=auth.get_password_hash(data.password),
        email=data.email,
        division=data.division,
    )
    db.add(student)
    db.commit()
    return {"message": "Student created"}


@app.get("/admin/students")
def list_students(admin=Depends(auth.require_admin), db: Session = Depends(get_db)):
    students = db.query(models.Student).filter(models.Student.is_admin == False).all()
    return [{"student_id": s.student_id, "name": s.name, "division": s.division} for s in students]


@app.post("/admin/subjects")
def create_subject(
    code: str,
    name: str,
    semester: int,
    admin=Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Subject).filter(models.Subject.code == code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject code already exists")
    subj = models.Subject(code=code, name=name, semester=semester)
    db.add(subj)
    db.commit()
    return {"message": "Subject created"}


@app.get("/admin/subjects")
def list_subjects(admin=Depends(auth.require_admin), db: Session = Depends(get_db)):
    subjects = db.query(models.Subject).all()
    return [{"id": s.id, "code": s.code, "name": s.name, "semester": s.semester} for s in subjects]


@app.put("/admin/marks")
def update_marks(
    data: MarksUpdate,
    admin=Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.student_id == data.student_id).first()
    subject = db.query(models.Subject).filter(models.Subject.code == data.subject_code).first()
    if not student or not subject:
        raise HTTPException(status_code=404, detail="Student or subject not found")

    mark = db.query(models.Marks).filter(
        models.Marks.student_id == student.id,
        models.Marks.subject_id == subject.id
    ).first()

    if mark:
        for field in ["insem1", "insem2", "insem3", "practical", "assignment", "endsem"]:
            val = getattr(data, field)
            if val is not None:
                setattr(mark, field, val)
    else:
        mark = models.Marks(
            student_id=student.id,
            subject_id=subject.id,
            insem1=data.insem1, insem2=data.insem2, insem3=data.insem3,
            practical=data.practical, assignment=data.assignment, endsem=data.endsem,
        )
        db.add(mark)
    db.commit()
    return {"message": "Marks updated"}


@app.post("/admin/import-excel")
async def import_excel(
    file: UploadFile = File(...),
    subject_code: str = "",
    admin=Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    """
    Excel columns required: student_id | insem1 | insem2 | insem3 | practical | assignment | endsem
    Leave cells blank for marks not yet entered.
    """
    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents))
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    subject = db.query(models.Subject).filter(models.Subject.code == subject_code).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found. Add it first in the Subjects tab.")

    updated, created, errors = 0, 0, []
    for _, row in df.iterrows():
        sid = str(row.get("student_id", "")).strip()
        student = db.query(models.Student).filter(models.Student.student_id == sid).first()
        if not student:
            errors.append(f"Student '{sid}' not found — skipped")
            continue

        mark = db.query(models.Marks).filter(
            models.Marks.student_id == student.id,
            models.Marks.subject_id == subject.id
        ).first()

        fields = ["insem1", "insem2", "insem3", "practical", "assignment", "endsem"]
        if mark:
            for f in fields:
                if f in row and pd.notna(row[f]):
                    setattr(mark, f, float(row[f]))
            updated += 1
        else:
            kwargs = {f: float(row[f]) if f in row and pd.notna(row[f]) else None for f in fields}
            mark = models.Marks(student_id=student.id, subject_id=subject.id, **kwargs)
            db.add(mark)
            created += 1

    db.commit()
    return {"updated": updated, "created": created, "errors": errors}


@app.post("/admin/bulk-create-students")
async def bulk_create_students(
    file: UploadFile = File(...),
    admin=Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    """
    Excel columns: student_id | name | email (optional) | division (optional) | password (optional)
    If password column is missing or blank, password defaults to the student's student_id.
    """
    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents))
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    created, skipped = 0, 0
    for _, row in df.iterrows():
        sid = str(row["student_id"]).strip()
        existing = db.query(models.Student).filter(models.Student.student_id == sid).first()
        if existing:
            skipped += 1
            continue
        raw_password = str(row.get("password", "")).strip()
        password = raw_password if raw_password and raw_password.lower() != "nan" else sid
        student = models.Student(
            student_id=sid,
            name=str(row["name"]).strip(),
            hashed_password=auth.get_password_hash(password),
            email=str(row.get("email", "")).strip() or None,
            division=str(row.get("division", "")).strip() or None,
        )
        db.add(student)
        created += 1
    db.commit()
    return {"created": created, "skipped": skipped}
