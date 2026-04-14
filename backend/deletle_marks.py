from database import engine
import models

# Drop ONLY marks table
models.Marks.__table__.drop(bind=engine)

print("Marks table dropped successfully!")