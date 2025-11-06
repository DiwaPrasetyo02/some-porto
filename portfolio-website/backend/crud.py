from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas

# About CRUD
def get_about(db: Session):
    return db.query(models.About).first()

def create_about(db: Session, about: schemas.AboutCreate):
    db_about = models.About(**about.dict())
    db.add(db_about)
    db.commit()
    db.refresh(db_about)
    return db_about

def update_about(db: Session, about_id: int, about: schemas.AboutUpdate):
    db_about = db.query(models.About).filter(models.About.id == about_id).first()
    if db_about:
        for key, value in about.dict(exclude_unset=True).items():
            setattr(db_about, key, value)
        db.commit()
        db.refresh(db_about)
    return db_about

# Stack CRUD
def get_stacks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Stack).order_by(models.Stack.order_index).offset(skip).limit(limit).all()

def get_stack(db: Session, stack_id: int):
    return db.query(models.Stack).filter(models.Stack.id == stack_id).first()

def create_stack(db: Session, stack: schemas.StackCreate):
    db_stack = models.Stack(**stack.dict())
    db.add(db_stack)
    db.commit()
    db.refresh(db_stack)
    return db_stack

def update_stack(db: Session, stack_id: int, stack: schemas.StackUpdate):
    db_stack = db.query(models.Stack).filter(models.Stack.id == stack_id).first()
    if db_stack:
        for key, value in stack.dict(exclude_unset=True).items():
            setattr(db_stack, key, value)
        db.commit()
        db.refresh(db_stack)
    return db_stack

def delete_stack(db: Session, stack_id: int):
    db_stack = db.query(models.Stack).filter(models.Stack.id == stack_id).first()
    if db_stack:
        db.delete(db_stack)
        db.commit()
        return True
    return False

# Project CRUD
def get_projects(db: Session, skip: int = 0, limit: int = 100, featured_only: bool = False):
    query = db.query(models.Project)
    if featured_only:
        query = query.filter(models.Project.featured == True)
    return query.order_by(models.Project.order_index).offset(skip).limit(limit).all()

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: int, project: schemas.ProjectUpdate):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project:
        for key, value in project.dict(exclude_unset=True).items():
            setattr(db_project, key, value)
        db.commit()
        db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project:
        db.delete(db_project)
        db.commit()
        return True
    return False

# Experience CRUD
def get_experiences(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Experience).order_by(models.Experience.order_index).offset(skip).limit(limit).all()

def get_experience(db: Session, experience_id: int):
    return db.query(models.Experience).filter(models.Experience.id == experience_id).first()

def create_experience(db: Session, experience: schemas.ExperienceCreate):
    db_experience = models.Experience(**experience.dict())
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    return db_experience

def update_experience(db: Session, experience_id: int, experience: schemas.ExperienceUpdate):
    db_experience = db.query(models.Experience).filter(models.Experience.id == experience_id).first()
    if db_experience:
        for key, value in experience.dict(exclude_unset=True).items():
            setattr(db_experience, key, value)
        db.commit()
        db.refresh(db_experience)
    return db_experience

def delete_experience(db: Session, experience_id: int):
    db_experience = db.query(models.Experience).filter(models.Experience.id == experience_id).first()
    if db_experience:
        db.delete(db_experience)
        db.commit()
        return True
    return False

# Education CRUD
def get_educations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Education).order_by(models.Education.order_index).offset(skip).limit(limit).all()

def get_education(db: Session, education_id: int):
    return db.query(models.Education).filter(models.Education.id == education_id).first()

def create_education(db: Session, education: schemas.EducationCreate):
    db_education = models.Education(**education.dict())
    db.add(db_education)
    db.commit()
    db.refresh(db_education)
    return db_education

def update_education(db: Session, education_id: int, education: schemas.EducationUpdate):
    db_education = db.query(models.Education).filter(models.Education.id == education_id).first()
    if db_education:
        for key, value in education.dict(exclude_unset=True).items():
            setattr(db_education, key, value)
        db.commit()
        db.refresh(db_education)
    return db_education

def delete_education(db: Session, education_id: int):
    db_education = db.query(models.Education).filter(models.Education.id == education_id).first()
    if db_education:
        db.delete(db_education)
        db.commit()
        return True
    return False

# Contact CRUD
def get_contacts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Contact).order_by(models.Contact.created_at.desc()).offset(skip).limit(limit).all()

def get_contact(db: Session, contact_id: int):
    return db.query(models.Contact).filter(models.Contact.id == contact_id).first()

def create_contact(db: Session, contact: schemas.ContactCreate):
    db_contact = models.Contact(**contact.dict())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def mark_contact_read(db: Session, contact_id: int):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if db_contact:
        db_contact.is_read = True
        db.commit()
        db.refresh(db_contact)
    return db_contact

def delete_contact(db: Session, contact_id: int):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if db_contact:
        db.delete(db_contact)
        db.commit()
        return True
    return False

# Social Link CRUD
def get_social_links(db: Session):
    return db.query(models.SocialLink).order_by(models.SocialLink.order_index).all()

def get_social_link(db: Session, link_id: int):
    return db.query(models.SocialLink).filter(models.SocialLink.id == link_id).first()

def create_social_link(db: Session, link: schemas.SocialLinkCreate):
    db_link = models.SocialLink(**link.dict())
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link

def update_social_link(db: Session, link_id: int, link: schemas.SocialLinkUpdate):
    db_link = db.query(models.SocialLink).filter(models.SocialLink.id == link_id).first()
    if db_link:
        for key, value in link.dict(exclude_unset=True).items():
            setattr(db_link, key, value)
        db.commit()
        db.refresh(db_link)
    return db_link

def delete_social_link(db: Session, link_id: int):
    db_link = db.query(models.SocialLink).filter(models.SocialLink.id == link_id).first()
    if db_link:
        db.delete(db_link)
        db.commit()
        return True
    return False

# Admin CRUD
def get_admin_by_username(db: Session, username: str):
    return db.query(models.Admin).filter(models.Admin.username == username).first()

def create_admin(db: Session, username: str, hashed_password: str):
    db_admin = models.Admin(username=username, hashed_password=hashed_password)
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin
