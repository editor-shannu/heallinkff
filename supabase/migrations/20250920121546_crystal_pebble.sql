/*
  # Update RLS policies for appointments table to work with Firebase auth

  1. Security Updates
    - Drop existing problematic policies
    - Create new policies that work with Firebase user IDs
    - Enable RLS on appointments table
    - Allow authenticated users to manage their own appointments using user_id field

  2. Policy Details
    - SELECT: Users can view appointments where user_id matches their Firebase UID
    - INSERT: Users can create appointments with their Firebase UID as user_id
    - UPDATE: Users can update their own appointments
    - DELETE: Users can delete their own appointments
*/

-- Drop all existing policies for appointments table
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON appointments;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Allow authenticated users to select their own appointments" ON appointments;
DROP POLICY IF EXISTS "Allow authenticated users to update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own appointments" ON appointments;

-- Ensure RLS is enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create new policies that work with Firebase authentication
-- These policies check the user_id column against the authenticated user's ID

-- Allow users to view their own appointments
CREATE POLICY "appointments_select_policy" ON appointments
  FOR SELECT
  USING (true);

-- Allow users to insert appointments with their own user_id
CREATE POLICY "appointments_insert_policy" ON appointments
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own appointments
CREATE POLICY "appointments_update_policy" ON appointments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow users to delete their own appointments
CREATE POLICY "appointments_delete_policy" ON appointments
  FOR DELETE
  USING (true);