export interface Hospital {
  id: string;
  hospital_name: string;
  email: string;
  password: string;
  city: string;
  address: string;
  phone: string;
  created_at: string;
}

export interface Patient {
  id: string;
  patient_name: string;
  email: string;
  password: string;
  phone: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  hospital_id: string;
  doctor_name: string;
  specialization: string;
  status: 'AVAILABLE' | 'BUSY' | 'ON_BREAK' | 'ABSENT';
  login_time: string | null;
  logout_time: string | null;
  created_at: string;
}

export interface EmergencyRequest {
  id: string;
  patient_id: string;
  hospital_id: string;
  doctor_id: string | null;
  emergency_type: string;
  description: string;
  status: 'NEW' | 'ACCEPTED' | 'COMPLETED';
  created_at: string;
  updated_at: string;
}

export interface EmergencyActivityLog {
  id: string;
  emergency_id: string;
  activity_type: string;
  description: string;
  created_by: string;
  created_at: string;
}
