from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True, nullable=False)  # e.g. "2021001"
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    division = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    marks = relationship("Marks", back_populates="student")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)   # e.g. "CS301"
    name = Column(String, nullable=False)             # e.g. "Data Structures"
    semester = Column(Integer, nullable=False)

    marks = relationship("Marks", back_populates="subject")


class Marks(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)

    insem1 = Column(Float, nullable=True)
    insem2 = Column(Float, nullable=True)
    insem3 = Column(Float, nullable=True)
    practical = Column(Float, nullable=True)
    assignment = Column(Float, nullable=True)
    endsem = Column(Float, nullable=True)

    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    student = relationship("Student", back_populates="marks")
    subject = relationship("Subject", back_populates="marks")
