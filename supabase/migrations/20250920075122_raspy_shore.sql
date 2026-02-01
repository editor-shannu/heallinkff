/*
  # Fix RLS policies for appointments table

  1. Security
    - Drop existing problematic policies
    - Enable RLS on appointments table
    - Create secure policies for authenticated users to manage only their own appointments
    
  2. Policies Created
    - Users can view their own appointments (SELECT)
    - Users can create their own appointments (INSERT)
    - Users can update their own appointments (UPDATE)
    - Users can delete their own appointments (DELETE)
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can read own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;

-- Ensure RLS is enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policy for SELECT operations
CREATE POLICY "Users can view their own appointments" ON appointments
FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

-- Create policy for INSERT operations
CREATE POLICY "Users can create their own appointments" ON appointments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

-- Create policy for UPDATE operations
CREATE POLICY "Users can update their own appointments" ON appointments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- Create policy for DELETE operations
CREATE POLICY "Users can delete their own appointments" ON appointments
FOR DELETE
TO authenticated
USING (user_id = auth.uid()::text);