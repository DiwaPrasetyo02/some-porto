#!/usr/bin/env python3
"""
Script to update admin password
Run this when you change ADMIN_PASSWORD in .env file
"""

import os
from dotenv import load_dotenv
from database import SessionLocal
from auth import get_password_hash
import crud

load_dotenv()

def update_admin_password():
    """Update admin password from .env"""
    db = SessionLocal()

    try:
        admin_username = os.getenv("ADMIN_USERNAME")
        admin_password = os.getenv("ADMIN_PASSWORD")

        if not admin_username or not admin_password:
            print("❌ ERROR: ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env file!")
            return False

        # Check password strength
        if admin_password in ["changeme123", "admin", "password", "123456"]:
            print("❌ ERROR: Weak password detected!")
            print("Password requirements:")
            print("  - Minimum 12 characters")
            print("  - Must contain: uppercase, lowercase, number, special character")
            return False

        if len(admin_password) < 12:
            print("❌ ERROR: Password must be at least 12 characters long!")
            return False

        # Get admin
        admin = crud.get_admin_by_username(db, admin_username)

        if not admin:
            print(f"❌ ERROR: Admin user '{admin_username}' not found!")
            print("Creating new admin user...")
            hashed_password = get_password_hash(admin_password)
            crud.create_admin(db, admin_username, hashed_password)
            print(f"✅ Admin user '{admin_username}' created successfully!")
            return True

        # Update password
        print(f"Updating password for admin: {admin_username}")
        hashed_password = get_password_hash(admin_password)
        admin.hashed_password = hashed_password
        db.commit()

        print("✅ Admin password updated successfully!")
        print(f"\nYou can now login with:")
        print(f"  Username: {admin_username}")
        print(f"  Password: {admin_password}")

        return True

    except Exception as e:
        print(f"❌ ERROR: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Admin Password Update Script")
    print("=" * 60)
    print()

    success = update_admin_password()

    if not success:
        print("\n⚠️  Password update failed!")
        exit(1)
    else:
        print("\n🎉 Done! You can now login to admin panel.")
        exit(0)
