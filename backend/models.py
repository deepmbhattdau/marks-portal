from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    email = Column(String, nullable=True)
    division = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True)
    name = Column(String)
    semester = Column(Integer)


class Marks(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))

    # Old marks (shown in red — old_endsem only shown if it has a value)
    old_insem1 = Column(Float, nullable=True)
    old_insem2 = Column(Float, nullable=True)
    old_endsem = Column(Float, nullable=True)

    # New marks (shown in green)
    insem1 = Column(Float, nullable=True)
    insem2 = Column(Float, nullable=True)
    endsem = Column(Float, nullable=True)

    # Labs
    lab1 = Column(Float, nullable=True)
    lab2 = Column(Float, nullable=True)
    lab3 = Column(Float, nullable=True)

    # Total
    total = Column(Float, nullable=True)