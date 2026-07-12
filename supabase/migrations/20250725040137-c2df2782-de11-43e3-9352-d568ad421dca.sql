-- Add new enum values one by one (each needs to be committed separately)
ALTER TYPE user_role ADD VALUE 'editor';
ALTER TYPE user_role ADD VALUE 'author';
ALTER TYPE user_role ADD VALUE 'member';