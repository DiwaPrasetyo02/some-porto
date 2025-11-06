#!/usr/bin/env python3
"""
Database initialization script for Portfolio Website
Run this script to initialize the database with sample data
"""

import sys
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
import models
import crud
from auth import get_password_hash
import os
from dotenv import load_dotenv

load_dotenv()

def init_db():
    """Initialize database with tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")

def create_sample_data():
    """Create sample data for testing"""
    db = SessionLocal()
    
    try:
        # Create admin user if not exists
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        admin = crud.get_admin_by_username(db, admin_username)
        if not admin:
            print(f"Creating admin user: {admin_username}")
            hashed_password = get_password_hash(os.getenv("ADMIN_PASSWORD", "changeme123"))
            crud.create_admin(db, admin_username, hashed_password)
            print("✓ Admin user created")
        else:
            print("✓ Admin user already exists")
        
        # Check if about section exists
        about = crud.get_about(db)
        if not about:
            print("Creating sample About section...")
            from schemas import AboutCreate
            sample_about = AboutCreate(
                title="Your Name",
                subtitle="Full Stack Developer | Tech Enthusiast",
                description="Welcome to my portfolio! I'm a passionate developer who loves building amazing web applications.",
                email="your.email@example.com",
                phone="+1234567890",
                location="Your City, Country"
            )
            crud.create_about(db, sample_about)
            print("✓ Sample About section created")
        
        # Create sample stack items if none exist
        if not crud.get_stacks(db):
            print("Creating sample Stack items...")
            from schemas import StackCreate
            
            stack_items = [
                StackCreate(name="React", category="Frontend", proficiency=90, order_index=1),
                StackCreate(name="Python", category="Backend", proficiency=95, order_index=2),
                StackCreate(name="FastAPI", category="Backend", proficiency=85, order_index=3),
                StackCreate(name="PostgreSQL", category="Database", proficiency=80, order_index=4),
                StackCreate(name="JavaScript", category="Frontend", proficiency=90, order_index=5),
            ]
            
            for item in stack_items:
                crud.create_stack(db, item)
            
            print("✓ Sample Stack items created")
        
        # Create sample project if none exist
        if not crud.get_projects(db):
            print("Creating sample Project...")
            from schemas import ProjectCreate
            
            sample_project = ProjectCreate(
                title="Portfolio Website",
                description="A full-stack portfolio website with admin panel built using React and FastAPI",
                short_description="Full-stack portfolio with CRUD admin panel",
                technologies="React, FastAPI, PostgreSQL, JWT",
                featured=True,
                order_index=1
            )
            crud.create_project(db, sample_project)
            print("✓ Sample Project created")
        
        # Create sample social links if none exist
        if not crud.get_social_links(db):
            print("Creating sample Social Links...")
            from schemas import SocialLinkCreate
            
            social_links = [
                SocialLinkCreate(platform="GitHub", url="https://github.com/yourusername", order_index=1),
                SocialLinkCreate(platform="LinkedIn", url="https://linkedin.com/in/yourusername", order_index=2),
                SocialLinkCreate(platform="Twitter", url="https://twitter.com/yourusername", order_index=3),
            ]
            
            for link in social_links:
                crud.create_social_link(db, link)
            
            print("✓ Sample Social Links created")
        
        print("\n✓ Database initialization complete!")
        print(f"\nAdmin Login Credentials:")
        print(f"  Username: {admin_username}")
        print(f"  Password: {os.getenv('ADMIN_PASSWORD', 'changeme123')}")
        print(f"\nIMPORTANT: Change your admin password after first login!")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Portfolio Website - Database Initialization")
    print("=" * 50)
    
    init_db()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--with-sample-data":
        print("\nCreating sample data...")
        create_sample_data()
    else:
        print("\nTo create sample data, run:")
        print("  python init_db.py --with-sample-data")
