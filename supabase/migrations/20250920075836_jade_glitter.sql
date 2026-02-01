/*
  # Fix RLS policies for appointments table

  1. Security
    - Drop all existing problematic policies
    - Enable RLS on appointments table
    - Create proper policies for authenticated users to manage only their own appointments
    - Each user can only insert/select/update/delete appointments where user_id = auth.uid()

  2. Policies Created
    - SELECT: Users can view their own appointments
    - INSERT: Users can create appointments for themselves
    - UPDATE: Users can modify their own appointments  
    - DELETE: Users can delete their own appointments
*/

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can read own data" ON appointments;
DROP POLICY IF EXISTS "Users can create their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON appointments;

-- Ensure RLS is enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy
CREATE POLICY "Users can view their own appointments" 
ON appointments 
FOR SELECT 
TO authenticated 
USING (auth.uid()::text = user_id);

-- Create INSERT policy
CREATE POLICY "Users can insert their own appointments" 
ON appointments 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid()::text = user_id);

-- Create UPDATE policy
CREATE POLICY "Users can update their own appointments" 
ON appointments 
FOR UPDATE 
TO authenticated 
USING (auth.uid()::text = user_id) 
WITH CHECK (auth.uid()::text = user_id);

-- Create DELETE policy
CREATE POLICY "Users can delete their own appointments" 
ON appointments 
FOR DELETE 
TO authenticated 
USING (auth.uid()::text = user_id);