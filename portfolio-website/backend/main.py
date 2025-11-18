from fastapi import FastAPI, Depends, HTTPException, status, Request, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import os
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

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

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Portfolio API",
    description="Backend API for Portfolio Website with Admin Panel",
    version="1.0.0"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Add HSTS only in production with HTTPS
    if os.getenv("ENVIRONMENT") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# CORS Configuration
# In production, use single origin. In development, allow multiple
if os.getenv("ENVIRONMENT") == "production":
    origins = [os.getenv("FRONTEND_URL")]
else:
    origins = [
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
        "http://localhost:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Set-Cookie"],
    expose_headers=["Set-Cookie"],
)

# Initialize default admin on startup
@app.on_event("startup")
async def startup_event():
    db = next(get_db())

    # Security: Force users to set credentials in .env
    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_username or not admin_password:
        print("⚠️  WARNING: ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env file!")
        print("⚠️  Admin panel will not be accessible until credentials are configured.")
        return

    if admin_password in ["changeme123", "admin", "password", "123456"]:
        raise ValueError(
            "🚨 SECURITY ERROR: Weak password detected! "
            "Set a strong ADMIN_PASSWORD in .env (min 12 chars, mix of upper, lower, numbers, symbols)"
        )

    admin = crud.get_admin_by_username(db, admin_username)
    if not admin:
        hashed_password = get_password_hash(admin_password)
        crud.create_admin(db, admin_username, hashed_password)
        print(f"✅ Admin created: {admin_username}")
        print("🔒 Password is securely hashed in database")

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

# Contact Form Route (Rate Limited to prevent spam)
@app.post("/api/contact", response_model=schemas.Contact, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def create_contact(request: Request, contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    return crud.create_contact(db, contact)

# ============= ADMIN AUTHENTICATION =============

@app.post("/api/admin/login")
@limiter.limit("5/minute")  # Prevent brute force attacks
def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
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

    # Set httpOnly cookie (more secure than localStorage)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,  # Prevents JavaScript access (XSS protection)
        secure=os.getenv("ENVIRONMENT") == "production",  # HTTPS only in production
        samesite="lax",  # CSRF protection
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "Login successful. Token stored in secure httpOnly cookie."
    }

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

# ============= ADMIN LOGOUT =============

@app.post("/api/admin/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}

# ============= BLOG ROUTES =============

# Public Blog Routes
@app.get("/api/blogs", response_model=List[schemas.Blog])
def get_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    published_only: bool = True,
    db: Session = Depends(get_db)
):
    return crud.get_blogs(db, skip=skip, limit=limit, published_only=published_only)

@app.get("/api/blogs/{slug}", response_model=schemas.Blog)
def get_blog_by_slug(slug: str, db: Session = Depends(get_db)):
    blog = crud.get_blog_by_slug(db, slug)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")

    # Increment view count
    crud.increment_blog_views(db, blog.id)

    return blog

# Admin Blog Routes
@app.get("/api/admin/blogs", response_model=List[schemas.Blog])
def get_all_blogs_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    return crud.get_blogs(db, skip=skip, limit=limit, published_only=False)

@app.post("/api/admin/blogs", response_model=schemas.Blog, status_code=status.HTTP_201_CREATED)
def create_blog_admin(
    blog: schemas.BlogCreate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    # Check if slug already exists
    existing = crud.get_blog_by_slug(db, blog.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Blog with this slug already exists")

    return crud.create_blog(db, blog)

@app.put("/api/admin/blogs/{blog_id}", response_model=schemas.Blog)
def update_blog_admin(
    blog_id: int,
    blog: schemas.BlogUpdate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    # Check if slug is being updated and already exists
    if blog.slug:
        existing = crud.get_blog_by_slug(db, blog.slug)
        if existing and existing.id != blog_id:
            raise HTTPException(status_code=400, detail="Blog with this slug already exists")

    updated_blog = crud.update_blog(db, blog_id, blog)
    if not updated_blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return updated_blog

@app.delete("/api/admin/blogs/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog_admin(
    blog_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    if not crud.delete_blog(db, blog_id):
        raise HTTPException(status_code=404, detail="Blog not found")
    return None

if __name__ == "__main__":
    import uvicorn
    # Use 8001 to avoid conflicts with other services
    uvicorn.run(app, host="0.0.0.0", port=8001)
