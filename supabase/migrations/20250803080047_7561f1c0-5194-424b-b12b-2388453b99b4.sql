-- First migration: Add new enum values separately
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'uploader';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'seo_manager';