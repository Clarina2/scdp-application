"""
Migration script to add phone column to users table
"""
import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal

async def add_phone_column():
    """Add phone column to users table if it doesn't exist"""
    async with AsyncSessionLocal() as db:
        try:
            # Check if column already exists
            result = await db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name = 'phone'
            """))
            exists = result.fetchone()
            
            if exists:
                print("Phone column already exists in users table")
                return
            
            # Add phone column
            await db.execute(text("""
                ALTER TABLE users 
                ADD COLUMN phone VARCHAR(20)
            """))
            await db.commit()
            print("Successfully added phone column to users table")
            
        except Exception as e:
            print(f"Error adding phone column: {e}")
            await db.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(add_phone_column())
