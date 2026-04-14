from database import engine
import models

print("Dropping all tables...")

# Drop EVERYTHING
models.Base.metadata.drop_all(bind=engine)

print("Creating fresh tables...")

# Recreate tables from updated models
models.Base.metadata.create_all(bind=engine)

print("Database reset complete!")