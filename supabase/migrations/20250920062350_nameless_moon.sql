/*
  # Create medical documents table

  1. New Tables
    - `medical_documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `type` (text)
      - `size` (integer)
      - `category` (text)
      - `file_path` (text)
      - `upload_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `medical_documents` table
    - Add policy for users to manage their own documents
*/

CREATE TABLE IF NOT EXISTS medical_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  size integer NOT NULL,
  category text NOT NULL DEFAULT 'general',
  file_path text,
  upload_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own medical documents"
  ON medical_documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_medical_documents_updated_at
    BEFORE UPDATE ON medical_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();