#!/usr/bin/env python3
"""
Debug login issues
This script helps diagnose why login is failing
"""

import os
from dotenv import load_dotenv
from database import SessionLocal
from auth import get_password_hash, verify_password
import models

load_dotenv()

def debug_login():
    """Debug login process step by step"""

    print("=" * 70)
    print("LOGIN DEBUG TOOL")
    print("=" * 70)

    # Step 1: Check .env credentials
    print("\n[STEP 1] Checking .env credentials...")
    print("-" * 70)

    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_username or not admin_password:
        print("❌ ERROR: ADMIN_USERNAME or ADMIN_PASSWORD not found in .env!")
        return False

    print(f"✅ .env credentials found:")
    print(f"   Username: '{admin_username}'")
    print(f"   Password: '{admin_password}' (length: {len(admin_password)})")

    # Step 2: Check password strength
    print("\n[STEP 2] Validating password strength...")
    print("-" * 70)

    has_upper = any(c.isupper() for c in admin_password)
    has_lower = any(c.islower() for c in admin_password)
    has_digit = any(c.isdigit() for c in admin_password)
    has_special = any(not c.isalnum() for c in admin_password)
    is_long_enough = len(admin_password) >= 12

    print(f"   Length >= 12: {'✅' if is_long_enough else '❌'} ({len(admin_password)} chars)")
    print(f"   Has uppercase: {'✅' if has_upper else '❌'}")
    print(f"   Has lowercase: {'✅' if has_lower else '❌'}")
    print(f"   Has digit: {'✅' if has_digit else '❌'}")
    print(f"   Has special char: {'✅' if has_special else '❌'}")

    if not all([is_long_enough, has_upper, has_lower, has_digit, has_special]):
        print("\n⚠️  WARNING: Password may not meet requirements!")

    # Step 3: Check database
    print("\n[STEP 3] Checking database...")
    print("-" * 70)

    db = SessionLocal()

    try:
        # Find admin by username
        admin = db.query(models.Admin).filter(models.Admin.username == admin_username).first()

        if not admin:
            print(f"❌ ERROR: Admin '{admin_username}' NOT FOUND in database!")

            # Show all admins
            all_admins = db.query(models.Admin).all()
            if all_admins:
                print("\n   Admins in database:")
                for a in all_admins:
                    print(f"   - '{a.username}' (ID: {a.id})")
            else:
                print("   Database has NO admin users!")

            return False

        print(f"✅ Admin found in database:")
        print(f"   ID: {admin.id}")
        print(f"   Username: '{admin.username}'")
        print(f"   Password Hash: {admin.hashed_password[:60]}...")
        print(f"   Hash Length: {len(admin.hashed_password)}")
        print(f"   Hash Algorithm: {'bcrypt' if admin.hashed_password.startswith('$2') else 'unknown'}")

        # Step 4: Test password hashing
        print("\n[STEP 4] Testing password hashing...")
        print("-" * 70)

        test_hash = get_password_hash(admin_password)
        print(f"✅ Test hash generated:")
        print(f"   {test_hash[:60]}...")

        # Step 5: Test password verification
        print("\n[STEP 5] Testing password verification...")
        print("-" * 70)

        is_valid = verify_password(admin_password, admin.hashed_password)

        if is_valid:
            print(f"✅ SUCCESS! Password verification PASSED!")
            print(f"\n   Password '{admin_password}' matches the hash in database!")
        else:
            print(f"❌ FAILURE! Password verification FAILED!")
            print(f"\n   Password '{admin_password}' does NOT match the hash in database!")
            print(f"\n   Possible causes:")
            print(f"   1. Password in .env is incorrect")
            print(f"   2. Password was changed but database wasn't updated")
            print(f"   3. Hash algorithm mismatch")

            # Try to fix by updating hash
            print("\n   Attempting to fix by updating password hash...")
            admin.hashed_password = test_hash
            db.commit()

            # Test again
            is_valid_now = verify_password(admin_password, admin.hashed_password)
            if is_valid_now:
                print("   ✅ FIXED! Password hash updated successfully!")
                print("   You can now login with the credentials from .env")
            else:
                print("   ❌ Still failing. There might be a deeper issue.")
                return False

        # Step 6: Final verification
        print("\n[STEP 6] Final verification...")
        print("-" * 70)

        # Re-fetch admin from DB
        db.refresh(admin)
        final_check = verify_password(admin_password, admin.hashed_password)

        if final_check:
            print("✅ FINAL CHECK PASSED!")
            print("\n" + "=" * 70)
            print("🎉 LOGIN SHOULD WORK NOW!")
            print("=" * 70)
            print(f"\nUse these credentials to login:")
            print(f"  Username: {admin_username}")
            print(f"  Password: {admin_password}")
            print("=" * 70)
            return True
        else:
            print("❌ FINAL CHECK FAILED!")
            return False

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = debug_login()

    if success:
        print("\n✅ Debug completed successfully!")
        exit(0)
    else:
        print("\n❌ Debug found issues. Please fix the errors above.")
        exit(1)
