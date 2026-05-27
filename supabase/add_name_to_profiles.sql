-- Add 'name' column to the profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS name text;

-- (Optional) If you want to populate existing users' names with their emails as a fallback:
-- UPDATE profiles
-- SET name = split_part((select email from auth.users where id = profiles.id), '@', 1)
-- WHERE name IS NULL;
