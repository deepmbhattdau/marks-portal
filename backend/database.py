from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'marks_portal.db')}"
USE_LOCAL_DB = os.getenv("USE_LOCAL_DB", "").lower() in {"1", "true", "yes"}
DATABASE_URL = LOCAL_DATABASE_URL if USE_LOCAL_DB else os.getenv("DATABASE_URL") or LOCAL_DATABASE_URL

engine_options = {"connect_args": {"check_same_thread": False}} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
