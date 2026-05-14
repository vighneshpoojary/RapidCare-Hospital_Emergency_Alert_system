/*
  # Seed Demo Data for RapidCare

  1. Demo Hospitals
  2. Demo Patients
  3. Demo Doctors
*/

-- Insert demo hospitals
INSERT INTO hospitals (hospital_name, email, password, city, address, phone) VALUES
  ('City General Hospital', 'citygen@hospital.com', 'demo123', 'New York', '123 Main Street, New York, NY 10001', '555-0101'),
  ('Metro Medical Center', 'metro@hospital.com', 'demo123', 'Los Angeles', '456 Healthcare Ave, Los Angeles, CA 90001', '555-0102'),
  ('Downtown Emergency Care', 'downtown@hospital.com', 'demo123', 'Chicago', '789 Medical Plaza, Chicago, IL 60601', '555-0103'),
  ('Riverside Health Hospital', 'riverside@hospital.com', 'demo123', 'New York', '321 River Road, New York, NY 10002', '555-0104')
ON CONFLICT DO NOTHING;

-- Insert demo patients
INSERT INTO patients (patient_name, email, password, phone) VALUES
  ('John Doe', 'john@example.com', 'demo123', '555-1001'),
  ('Jane Smith', 'jane@example.com', 'demo123', '555-1002'),
  ('Robert Johnson', 'robert@example.com', 'demo123', '555-1003'),
  ('Sarah Williams', 'sarah@example.com', 'demo123', '555-1004'),
  ('Michael Brown', 'michael@example.com', 'demo123', '555-1005')
ON CONFLICT DO NOTHING;

-- Insert demo doctors for each hospital
DO $$
DECLARE
  hosp_id UUID;
  doctor_count INT := 0;
BEGIN
  -- Get first hospital
  SELECT id INTO hosp_id FROM hospitals WHERE hospital_name = 'City General Hospital' LIMIT 1;
  
  IF hosp_id IS NOT NULL THEN
    INSERT INTO doctors (hospital_id, doctor_name, specialization, status) VALUES
      (hosp_id, 'Dr. James Wilson', 'Cardiology', 'AVAILABLE'),
      (hosp_id, 'Dr. Emily Davis', 'Emergency Medicine', 'AVAILABLE'),
      (hosp_id, 'Dr. Michael Chen', 'Surgery', 'AVAILABLE'),
      (hosp_id, 'Dr. Lisa Anderson', 'Neurology', 'ABSENT')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Get second hospital
  SELECT id INTO hosp_id FROM hospitals WHERE hospital_name = 'Metro Medical Center' LIMIT 1;
  
  IF hosp_id IS NOT NULL THEN
    INSERT INTO doctors (hospital_id, doctor_name, specialization, status) VALUES
      (hosp_id, 'Dr. David Martinez', 'Emergency Medicine', 'AVAILABLE'),
      (hosp_id, 'Dr. Rachel Green', 'Trauma Surgery', 'AVAILABLE'),
      (hosp_id, 'Dr. Christopher Lee', 'Orthopedics', 'ON_BREAK')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Get third hospital
  SELECT id INTO hosp_id FROM hospitals WHERE hospital_name = 'Downtown Emergency Care' LIMIT 1;
  
  IF hosp_id IS NOT NULL THEN
    INSERT INTO doctors (hospital_id, doctor_name, specialization, status) VALUES
      (hosp_id, 'Dr. Patricia White', 'Emergency Medicine', 'AVAILABLE'),
      (hosp_id, 'Dr. Kevin Johnson', 'General Medicine', 'AVAILABLE'),
      (hosp_id, 'Dr. Amanda Brown', 'Critical Care', 'BUSY')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Get fourth hospital
  SELECT id INTO hosp_id FROM hospitals WHERE hospital_name = 'Riverside Health Hospital' LIMIT 1;
  
  IF hosp_id IS NOT NULL THEN
    INSERT INTO doctors (hospital_id, doctor_name, specialization, status) VALUES
      (hosp_id, 'Dr. Thomas Harris', 'Emergency Medicine', 'AVAILABLE'),
      (hosp_id, 'Dr. Nancy Taylor', 'Cardiology', 'AVAILABLE'),
      (hosp_id, 'Dr. Charles Miller', 'Neurology', 'ABSENT')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;