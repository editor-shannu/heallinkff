/*
  # Update notifications RLS policies

  1. Security
    - Drop existing restrictive RLS policies on `notifications` table
    - Add permissive policies that allow all authenticated operations
    - This allows Firebase-authenticated users to create and manage notifications

  2. Changes
    - Replace user-specific policies with general authenticated user policies
    - Allow INSERT, SELECT, UPDATE, DELETE for all authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;

-- Create new permissive policies for authenticated users
CREATE POLICY "Allow authenticated users to insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (true);