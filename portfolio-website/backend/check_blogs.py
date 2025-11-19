#!/usr/bin/env python3
"""
Check blog status in database
Shows which blogs are published/draft
"""

from database import SessionLocal
import models
from datetime import datetime

def check_blogs():
    """Check all blogs in database"""
    db = SessionLocal()

    try:
        print("=" * 80)
        print("BLOG STATUS CHECKER")
        print("=" * 80)

        blogs = db.query(models.Blog).order_by(models.Blog.created_at.desc()).all()

        if not blogs:
            print("\n❌ No blogs found in database!")
            print("\nCreate a blog via admin dashboard:")
            print("  1. Go to http://localhost:5173/admin/dashboard")
            print("  2. Click 'Blog' in sidebar")
            print("  3. Click 'Add New Blog'")
            return False

        print(f"\nFound {len(blogs)} blog(s) in database:\n")

        published_count = 0
        draft_count = 0

        for idx, blog in enumerate(blogs, 1):
            status = "✅ PUBLISHED" if blog.published else "❌ DRAFT"
            icon = "👁️" if blog.published else "👁️‍🗨️"

            if blog.published:
                published_count += 1
            else:
                draft_count += 1

            print(f"{idx}. {icon} [{status}]")
            print(f"   Title: {blog.title}")
            print(f"   Slug: /{blog.slug}")
            print(f"   URL: http://localhost:5173/blog/{blog.slug}")
            print(f"   Views: {blog.views}")
            print(f"   Created: {blog.created_at.strftime('%Y-%m-%d %H:%M:%S')}")

            if blog.published:
                print(f"   Published at: {blog.published_at.strftime('%Y-%m-%d %H:%M:%S') if blog.published_at else 'N/A'}")
                print(f"   ✅ Visible at: http://localhost:5173/blog")
            else:
                print(f"   ❌ NOT visible at http://localhost:5173/blog (draft only)")

            print()

        print("=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"Total Blogs: {len(blogs)}")
        print(f"Published (visible to public): {published_count}")
        print(f"Drafts (admin only): {draft_count}")
        print()

        if draft_count > 0:
            print("⚠️  WARNING: You have draft blogs that are NOT visible at /blog")
            print("\nTo publish a blog:")
            print("  1. Go to http://localhost:5173/admin/dashboard")
            print("  2. Click 'Blog' in sidebar")
            print("  3. Click 'Edit' (pencil icon) on the blog")
            print("  4. CHECK the 'Publish (make visible to public)' checkbox")
            print("  5. Click 'Update'")
            print("  6. Refresh http://localhost:5173/blog")
            print()

        if published_count == 0:
            print("❌ NO PUBLISHED BLOGS!")
            print("   This is why http://localhost:5173/blog shows 'No blog posts yet'")
            print()
            return False
        else:
            print(f"✅ {published_count} blog(s) should be visible at http://localhost:5173/blog")
            print()
            return True

    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    check_blogs()
