from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import os
from dotenv import load_dotenv

import models
import schemas
import crud
from database import engine, get_db
from auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_admin,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Portfolio API",
    description="Backend API for Portfolio Website with Admin Panel",
    version="1.0.0"
)

# CORS Configuration
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize default admin on startup
@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    admin = crud.get_admin_by_username(db, os.getenv("ADMIN_USERNAME", "admin"))
    if not admin:
        hashed_password = get_password_hash(os.getenv("ADMIN_PASSWORD", "changeme123"))
        crud.create_admin(db, os.getenv("ADMIN_USERNAME", "admin"), hashed_password)
        print("Default admin created")

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Portfolio API is running", "version": "1.0.0"}

# ============= PUBLIC ROUTES =============

# About Routes
@app.get("/api/about", response_model=schemas.About)
def get_about(db: Session = Depends(get_db)):
    about = crud.get_about(db)
    if not about:
        raise HTTPException(status_code=404, detail="About section not found")
    return about

# Stack Routes
@app.get("/api/stack", response_model=List[schemas.Stack])
def get_stacks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_stacks(db, skip=skip, limit=limit)

# Project Routes
@app.get("/api/projects", response_model=List[schemas.Project])
def get_projects(featured: bool = False, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_projects(db, skip=skip, limit=limit, featured_only=featured)

@app.get("/api/projects/{project_id}", response_model=schemas.Project)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# Experience Routes
@app.get("/api/experience", response_model=List[schemas.Experience])
def get_experiences(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_experiences(db, skip=skip, limit=limit)

# Education Routes
@app.get("/api/education", response_model=List[schemas.Education])
def get_educations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_educations(db, skip=skip, limit=limit)

# Social Links Routes
@app.get("/api/social-links", response_model=List[schemas.SocialLink])
def get_social_links(db: Session = Depends(get_db)):
    return crud.get_social_links(db)

# Contact Form Route
@app.post("/api/contact", response_model=schemas.Contact, status_code=status.HTTP_201_CREATED)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    return crud.create_contact(db, contact)

# ============= ADMIN AUTHENTICATION =============

@app.post("/api/admin/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = crud.get_admin_by_username(db, form_data.username)
    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/admin/verify")
def verify_admin(current_admin: str = Depends(get_current_admin)):
    return {"username": current_admin, "authenticated": True}

# ============= ADMIN PROTECTED ROUTES =============

# About Admin Routes
@app.post("/api/admin/about", response_model=schemas.About)
def create_about_admin(
    about: schemas.AboutCreate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    return crud.create_about(db, about)

@app.put("/api/admin/about/{about_id}", response_model=schemas.About)
def update_about_admin(
    about_id: int,
    about: schemas.AboutUpdate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    updated_about = crud.update_about(db, about_id, about)
    if not updated_about:
        raise HTTPException(status_code=404, detail="About section not found")
    return updated_about

# Stack Admin Routes
@app.post("/api/admin/stack", response_model=schemas.Stack, status_code=status.HTTP_201_CREATED)
def create_stack_admin(
    stack: schemas.StackCreate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    return crud.create_stack(db, stack)

@app.put("/api/admin/stack/{stack_id}", response_model=schemas.Stack)
def update_stack_admin(
    stack_id: int,
    stack: schemas.StackUpdate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    updated_stack = crud.update_stack(db, stack_id, stack)
    if not updated_stack:
        raise HTTPException(status_code=404, detail="Stack not found")
    return updated_stack

@app.delete("/api/admin/stack/{stack_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stack_admin(
    stack_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    if not crud.delete_stack(db, stack_id):
        raise HTTPException(status_code=404, detail="Stack not found")
    return None

# Project Admin Routes
@app.post("/api/admin/projects", response_model=schemas.Project, status_code=status.HTTP_201_CREATED)
def create_project_admin(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    return crud.create_project(db, project)

@app.put("/api/admin/projects/{project_id}", response_model=schemas.Project)
def update_project_admin(
    project_id: int,
    project: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    updated_project = crud.update_project(db, project_id, project)
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated_project

@app.delete("/api/admin/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_admin(
    project_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    if not crud.delete_project(db, project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return None

# Experience Admin Routes
@app.post("/api/admin/experience", response_model=schemas.Experience, status_code=status.HTTP_201_CREATED)
def create_experience_admin(
    experience: schemas.ExperienceCreate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    return crud.create_experience(db, experience)

@app.put("/api/admin/experience/{experience_id}", response_model=schemas.Experience)
def update_experience_admin(
    experience_id: int,
    experience: schemas.ExperienceUpdate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    updated_experience = crud.update_experience(db, experience_id, experience)
    if not updated_experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    return updated_experience

@app.delete("/api/admin/experience/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience_admin(
    experience_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    if not crud.delete_experience(db, experience_id):
        raise HTTPException(status_code=404, detail="Experience not found")
    return None

# Education Admin Routes
@app.post("/api/admin/education", response_model=schemas.Education, status_code=status.HTTP_201_CREATED)
def create_education_admin(
    education: schemas.EducationCreate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    return crud.create_education(db, education)

@app.put("/api/admin/education/{education_id}", response_model=schemas.Education)
def update_education_admin(
    education_id: int,
    education: schemas.EducationUpdate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    updated_education = crud.update_education(db, education_id, education)
    if not updated_education:
        raise HTTPException(status_code=404, detail="Education not found")
    return updated_education

@app.delete("/api/admin/education/{education_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_education_admin(
    education_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    if not crud.delete_education(db, education_id):
        raise HTTPException(status_code=404, detail="Education not found")
    return None

# Social Link Admin Routes
@app.post("/api/admin/social-links", response_model=schemas.SocialLink, status_code=status.HTTP_201_CREATED)
def create_social_link_admin(
    link: schemas.SocialLinkCreate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    return crud.create_social_link(db, link)

@app.put("/api/admin/social-links/{link_id}", response_model=schemas.SocialLink)
def update_social_link_admin(
    link_id: int,
    link: schemas.SocialLinkUpdate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    updated_link = crud.update_social_link(db, link_id, link)
    if not updated_link:
        raise HTTPException(status_code=404, detail="Social link not found")
    return updated_link

@app.delete("/api/admin/social-links/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_social_link_admin(
    link_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    if not crud.delete_social_link(db, link_id):
        raise HTTPException(status_code=404, detail="Social link not found")
    return None

# Contact Admin Routes
@app.get("/api/admin/contacts", response_model=List[schemas.Contact])
def get_contacts_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    return crud.get_contacts(db, skip=skip, limit=limit)

@app.put("/api/admin/contacts/{contact_id}/read", response_model=schemas.Contact)
def mark_contact_read_admin(
    contact_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    contact = crud.mark_contact_read(db, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@app.delete("/api/admin/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact_admin(
    contact_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    if not crud.delete_contact(db, contact_id):
        raise HTTPException(status_code=404, detail="Contact not found")
    return None

if __name__ == "__main__":
    import uvicorn
    # Use 8001 to avoid conflicts with other services
    uvicorn.run(app, host="0.0.0.0", port=8001)
