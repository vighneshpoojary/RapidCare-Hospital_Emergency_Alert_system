/*
  # RapidCare Emergency Response System Schema

  1. New Tables
    - `hospitals`
      - `id` (uuid, primary key)
      - `hospital_name` (text)
      - `email` (text, unique)
      - `password` (text)
      - `city` (text)
      - `address` (text)
      - `phone` (text)
      - `created_at` (timestamptz)
    
    - `patients`
      - `id` (uuid, primary key)
      - `patient_name` (text)
      - `email` (text, unique)
      - `password` (text)
      - `phone` (text)
      - `created_at` (timestamptz)
    
    - `doctors`
      - `id` (uuid, primary key)
      - `hospital_id` (uuid, foreign key)
      - `doctor_name` (text)
      - `specialization` (text)
      - `status` (text) - AVAILABLE, BUSY, ON_BREAK, ABSENT
      - `login_time` (timestamptz)
      - `logout_time` (timestamptz)
      - `created_at` (timestamptz)
    
    - `emergency_request`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key)
      - `hospital_id` (uuid, foreign key)
      - `doctor_id` (uuid, foreign key, nullable)
      - `emergency_type` (text)
      - `description` (text)
      - `status` (text) - NEW, ACCEPTED, COMPLETED
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `emergency_activity_log`
      - `id` (uuid, primary key)
      - `emergency_id` (uuid, foreign key)
      - `activity_type` (text)
      - `description` (text)
      - `created_by` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since we're handling auth manually)
*/

-- Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to hospitals"
  ON hospitals FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to hospitals"
  ON hospitals FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to hospitals"
  ON hospitals FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to patients"
  ON patients FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to patients"
  ON patients FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to patients"
  ON patients FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  doctor_name text NOT NULL,
  specialization text DEFAULT '',
  status text DEFAULT 'ABSENT',
  login_time timestamptz,
  logout_time timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to doctors"
  ON doctors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to doctors"
  ON doctors FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to doctors"
  ON doctors FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to doctors"
  ON doctors FOR DELETE
  TO public
  USING (true);

-- Emergency Request Table
CREATE TABLE IF NOT EXISTS emergency_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  hospital_id uuid NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  emergency_type text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'NEW',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_request ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to emergency_request"
  ON emergency_request FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to emergency_request"
  ON emergency_request FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to emergency_request"
  ON emergency_request FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to emergency_request"
  ON emergency_request FOR DELETE
  TO public
  USING (true);

-- Emergency Activity Log Table
CREATE TABLE IF NOT EXISTS emergency_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id uuid NOT NULL REFERENCES emergency_request(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  description text NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to emergency_activity_log"
  ON emergency_activity_log FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to emergency_activity_log"
  ON emergency_activity_log FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to emergency_activity_log"
  ON emergency_activity_log FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to emergency_activity_log"
  ON emergency_activity_log FOR DELETE
  TO public
  USING (true);