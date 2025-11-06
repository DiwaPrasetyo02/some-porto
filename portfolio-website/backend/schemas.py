from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# About Schemas
class AboutBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: str
    profile_image: Optional[str] = None
    resume_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

class AboutCreate(AboutBase):
    pass

class AboutUpdate(AboutBase):
    title: Optional[str] = None
    description: Optional[str] = None

class About(AboutBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Stack Schemas
class StackBase(BaseModel):
    name: str
    category: Optional[str] = None
    icon: Optional[str] = None
    proficiency: Optional[int] = None
    description: Optional[str] = None
    order_index: int = 0

class StackCreate(StackBase):
    pass

class StackUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None
    proficiency: Optional[int] = None
    description: Optional[str] = None
    order_index: Optional[int] = None

class Stack(StackBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    description: str
    short_description: Optional[str] = None
    image: Optional[str] = None
    technologies: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    featured: bool = False
    order_index: int = 0

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    image: Optional[str] = None
    technologies: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    featured: Optional[bool] = None
    order_index: Optional[int] = None

class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Experience Schemas
class ExperienceBase(BaseModel):
    company: str
    position: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None
    is_current: bool = False
    order_index: int = 0

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None
    is_current: Optional[bool] = None
    order_index: Optional[int] = None

class Experience(ExperienceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Education Schemas
class EducationBase(BaseModel):
    institution: str
    degree: str
    field: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    grade: Optional[str] = None
    order_index: int = 0

class EducationCreate(EducationBase):
    pass

class EducationUpdate(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    grade: Optional[str] = None
    order_index: Optional[int] = None

class Education(EducationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Contact Schemas
class ContactBase(BaseModel):
    name: str
    email: str
    subject: Optional[str] = None
    message: str

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Social Link Schemas
class SocialLinkBase(BaseModel):
    platform: str
    url: str
    icon: Optional[str] = None
    order_index: int = 0

class SocialLinkCreate(SocialLinkBase):
    pass

class SocialLinkUpdate(BaseModel):
    platform: Optional[str] = None
    url: Optional[str] = None
    icon: Optional[str] = None
    order_index: Optional[int] = None

class SocialLink(SocialLinkBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Admin Schemas
class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
