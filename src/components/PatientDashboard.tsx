import { useState, useEffect } from 'react';
import { LogOut, Search, AlertCircle, Clock, CheckCircle, Building2, User, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Patient, Hospital, Doctor, EmergencyRequest, EmergencyActivityLog } from '../types/database';

interface PatientDashboardProps {
  patient: Patient;
  onLogout: () => void;
}

interface HospitalWithDoctors extends Hospital {
  doctors: Doctor[];
}

export default function PatientDashboard({ patient, onLogout }: PatientDashboardProps) {
  const [searchCity, setSearchCity] = useState('');
  const [hospitals, setHospitals] = useState<HospitalWithDoctors[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalWithDoctors | null>(null);
  const [emergencyType, setEmergencyType] = useState('');
  const [description, setDescription] = useState('');
  const [myEmergencies, setMyEmergencies] = useState<EmergencyRequest[]>([]);
  const [activityLogs, setActivityLogs] = useState<EmergencyActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);

  const searchHospitals = async () => {
    if (!searchCity.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .ilike('city', `%${searchCity}%`);

      if (error) throw error;

      const hospitalsWithDoctors = await Promise.all(
        (data || []).map(async (hospital) => {
          const { data: doctors } = await supabase
            .from('doctors')
            .select('*')
            .eq('hospital_id', hospital.id);

          return { ...hospital, doctors: doctors || [] };
        })
      );

      setHospitals(hospitalsWithDoctors);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadMyEmergencies = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_request')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyEmergencies(data || []);

      if (data && data.length > 0) {
        const emergencyIds = data.map(e => e.id);
        const { data: logs } = await supabase
          .from('emergency_activity_log')
          .select('*')
          .in('emergency_id', emergencyIds)
          .order('created_at', { ascending: false });

        setActivityLogs(logs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMyEmergencies();
    const interval = setInterval(loadMyEmergencies, 5000);
    return () => clearInterval(interval);
  }, [patient.id]);

  const handleEmergencyRequest = async () => {
    if (!selectedHospital || !emergencyType.trim()) return;

    setLoading(true);
    try {
      const { data: emergency, error } = await supabase
        .from('emergency_request')
        .insert({
          patient_id: patient.id,
          hospital_id: selectedHospital.id,
          emergency_type: emergencyType,
          description: description,
          status: 'NEW',
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('emergency_activity_log')
        .insert({
          emergency_id: emergency.id,
          activity_type: 'CREATED',
          description: `Emergency request created: ${emergencyType}`,
          created_by: patient.patient_name,
        });

      setEmergencyType('');
      setDescription('');
      setShowEmergencyForm(false);
      loadMyEmergencies();
      alert('Emergency request sent successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to send emergency request');
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'ACCEPTED':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'COMPLETED':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Clock className="w-5 h-5" />;
      case 'ACCEPTED':
        return <Activity className="w-5 h-5" />;
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Patient Dashboard</h1>
            <p className="text-cyan-300 text-sm">Welcome, {patient.patient_name}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors border border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-800/80 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-6 h-6 text-cyan-400" />
                Search Hospitals by City
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchHospitals()}
                  className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter city name"
                />
                <button
                  onClick={searchHospitals}
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  Search
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {hospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className={`bg-slate-900/50 border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedHospital?.id === hospital.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-600 hover:border-cyan-500/50'
                    }`}
                    onClick={() => setSelectedHospital(hospital)}
                  >
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-cyan-400 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{hospital.hospital_name}</h3>
                        <p className="text-sm text-slate-400">{hospital.address}</p>
                        <div className="mt-2 flex gap-4 text-xs">
                          <span className="text-green-400">
                            Available: {hospital.doctors.filter(d => d.status === 'AVAILABLE').length}
                          </span>
                          <span className="text-yellow-400">
                            Busy: {hospital.doctors.filter(d => d.status === 'BUSY').length}
                          </span>
                          <span className="text-slate-400">
                            Total: {hospital.doctors.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedHospital && (
              <div className="bg-slate-800/80 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-6 h-6 text-cyan-400" />
                  Doctors at {selectedHospital.hospital_name}
                </h2>

                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {selectedHospital.doctors.map((doctor) => (
                    <div key={doctor.id} className="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{doctor.doctor_name}</p>
                          <p className="text-sm text-slate-400">{doctor.specialization || 'General'}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            doctor.status === 'AVAILABLE'
                              ? 'bg-green-500/20 text-green-400'
                              : doctor.status === 'BUSY'
                              ? 'bg-red-500/20 text-red-400'
                              : doctor.status === 'ON_BREAK'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {doctor.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {!showEmergencyForm ? (
                  <button
                    onClick={() => setShowEmergencyForm(true)}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5" />
                    Send Emergency Request
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={emergencyType}
                      onChange={(e) => setEmergencyType(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      placeholder="Emergency type (e.g., Accident, Heart Attack)"
                    />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      placeholder="Description (optional)"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleEmergencyRequest}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
                      >
                        Send Request
                      </button>
                      <button
                        onClick={() => setShowEmergencyForm(false)}
                        className="px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/80 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-cyan-400" />
                My Emergency Requests
              </h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {myEmergencies.map((emergency) => (
                  <div key={emergency.id} className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-white">{emergency.emergency_type}</p>
                        <p className="text-sm text-slate-400">{emergency.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(emergency.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${getStatusColor(emergency.status)}`}>
                        {getStatusIcon(emergency.status)}
                        {emergency.status}
                      </div>
                    </div>
                  </div>
                ))}
                {myEmergencies.length === 0 && (
                  <p className="text-slate-400 text-center py-8">No emergency requests yet</p>
                )}
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Activity Log</h2>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activityLogs.map((log) => (
                  <div key={log.id} className="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-cyan-300">{log.activity_type}</p>
                        <p className="text-sm text-slate-300">{log.description}</p>
                        <p className="text-xs text-slate-500 mt-1">by {log.created_by}</p>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {activityLogs.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No activity yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
