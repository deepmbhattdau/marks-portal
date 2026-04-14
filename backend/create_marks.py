from database import engine
import models

models.Marks.__table__.create(bind=engine, checkfirst=True)

print("Marks table created successfully!")