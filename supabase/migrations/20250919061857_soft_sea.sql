/*
  # Appointment Management System

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `doctor_name` (text)
      - `doctor_specialty` (text)
      - `doctor_avatar` (text)
      - `hospital_name` (text)
      - `appointment_date` (date)
      - `appointment_time` (text)
      - `patient_name` (text)
      - `patient_phone` (text)
      - `patient_email` (text)
      - `symptoms` (text)
      - `status` (text, default 'scheduled')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `appointments` table
    - Add policies for users to manage their own appointments
*/

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_name text NOT NULL,
  doctor_specialty text NOT NULL,
  doctor_avatar text DEFAULT '',
  hospital_name text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  patient_name text NOT NULL,
  patient_phone text NOT NULL,
  patient_email text NOT NULL,
  symptoms text DEFAULT '',
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own appointments
CREATE POLICY "Users can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own appointments
CREATE POLICY "Users can create own appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own appointments
CREATE POLICY "Users can update own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own appointments
CREATE POLICY "Users can delete own appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();