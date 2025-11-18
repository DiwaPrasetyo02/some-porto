#!/usr/bin/env python3
"""
Force reset admin credentials - Direct database access
This script bypasses all validations and directly updates the database
"""

import sys
from sqlalchemy import text
from database import SessionLocal, engine
from auth import get_password_hash
import models

def show_current_admins():
    """Show all admin users in database"""
    db = SessionLocal()
    try:
        print("\n" + "=" * 60)
        print("CURRENT ADMIN USERS IN DATABASE")
        print("=" * 60)

        admins = db.query(models.Admin).all()

        if not admins:
            print("❌ No admin users found in database!")
            return []

        for idx, admin in enumerate(admins, 1):
            print(f"\n{idx}. Username: {admin.username}")
            print(f"   ID: {admin.id}")
            print(f"   Password Hash: {admin.hashed_password[:50]}...")

        return admins
    finally:
        db.close()

def force_update_password(username, new_password):
    """Force update password directly via SQL"""
    db = SessionLocal()

    try:
        print(f"\n🔄 Force updating password for: {username}")

        # Hash the new password
        hashed_password = get_password_hash(new_password)
        print(f"✅ Password hashed successfully")
        print(f"   Hash preview: {hashed_password[:50]}...")

        # Direct SQL update to bypass any ORM issues
        result = db.execute(
            text("UPDATE admin SET hashed_password = :hash WHERE username = :username"),
            {"hash": hashed_password, "username": username}
        )
        db.commit()

        if result.rowcount == 0:
            print(f"❌ ERROR: No admin user found with username '{username}'")
            return False

        print(f"✅ Password updated successfully! ({result.rowcount} row(s) affected)")
        print(f"\n{'='*60}")
        print("NEW LOGIN CREDENTIALS:")
        print("=" * 60)
        print(f"Username: {username}")
        print(f"Password: {new_password}")
        print("=" * 60)

        return True

    except Exception as e:
        print(f"❌ ERROR: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def create_new_admin(username, password):
    """Create a brand new admin user"""
    db = SessionLocal()

    try:
        # Check if username exists
        existing = db.query(models.Admin).filter(models.Admin.username == username).first()
        if existing:
            print(f"⚠️  Admin '{username}' already exists!")
            choice = input("Delete and recreate? (yes/no): ").lower()
            if choice == 'yes':
                db.delete(existing)
                db.commit()
                print(f"✅ Deleted existing admin")
            else:
                return False

        # Create new admin
        hashed_password = get_password_hash(password)
        new_admin = models.Admin(
            username=username,
            hashed_password=hashed_password
        )
        db.add(new_admin)
        db.commit()

        print(f"✅ New admin created successfully!")
        print(f"\n{'='*60}")
        print("NEW ADMIN CREDENTIALS:")
        print("=" * 60)
        print(f"Username: {username}")
        print(f"Password: {password}")
        print("=" * 60)

        return True

    except Exception as e:
        print(f"❌ ERROR: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def interactive_mode():
    """Interactive mode to reset admin password"""
    print("\n" + "=" * 60)
    print("FORCE ADMIN PASSWORD RESET")
    print("=" * 60)

    # Show current admins
    admins = show_current_admins()

    print("\n" + "=" * 60)
    print("CHOOSE AN OPTION:")
    print("=" * 60)
    print("1. Update existing admin password")
    print("2. Create new admin user")
    print("3. Exit")

    choice = input("\nEnter choice (1/2/3): ").strip()

    if choice == "1":
        print("\n--- UPDATE EXISTING ADMIN ---")
        username = input("Enter username to update: ").strip()
        password = input("Enter NEW password (min 12 chars): ").strip()

        if len(password) < 12:
            print("❌ Password must be at least 12 characters!")
            return False

        confirm = input(f"\n⚠️  Update password for '{username}'? (yes/no): ").lower()
        if confirm == 'yes':
            return force_update_password(username, password)
        else:
            print("❌ Cancelled")
            return False

    elif choice == "2":
        print("\n--- CREATE NEW ADMIN ---")
        username = input("Enter new username: ").strip()
        password = input("Enter password (min 12 chars): ").strip()

        if len(password) < 12:
            print("❌ Password must be at least 12 characters!")
            return False

        return create_new_admin(username, password)

    else:
        print("👋 Exiting...")
        return False

def quick_reset_from_env():
    """Quick reset using .env credentials"""
    import os
    from dotenv import load_dotenv

    load_dotenv()

    username = os.getenv("ADMIN_USERNAME")
    password = os.getenv("ADMIN_PASSWORD")

    if not username or not password:
        print("❌ ADMIN_USERNAME and ADMIN_PASSWORD not found in .env file!")
        return False

    print(f"\n🔄 Using credentials from .env file:")
    print(f"   Username: {username}")
    print(f"   Password: {password}")

    # Validate password
    if len(password) < 12:
        print("\n❌ ERROR: Password in .env is too short (min 12 characters)")
        print("Please update ADMIN_PASSWORD in .env file first!")
        return False

    return force_update_password(username, password)

if __name__ == "__main__":
    print("=" * 60)
    print("ADMIN PASSWORD FORCE RESET TOOL")
    print("=" * 60)
    print("\nThis tool directly updates the database, bypassing all validations.")
    print("Use this when normal password update fails.")

    if len(sys.argv) > 1 and sys.argv[1] == "--from-env":
        # Quick mode using .env
        success = quick_reset_from_env()
    else:
        # Interactive mode
        success = interactive_mode()

    if success:
        print("\n" + "=" * 60)
        print("✅ SUCCESS! You can now login to admin panel.")
        print("=" * 60)
        exit(0)
    else:
        print("\n" + "=" * 60)
        print("❌ FAILED! Please check the errors above.")
        print("=" * 60)
        exit(1)
