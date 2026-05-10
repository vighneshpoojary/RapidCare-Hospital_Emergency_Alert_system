import { useState, useEffect } from 'react';
import { LogOut, Users, Activity, AlertCircle, Plus, CreditCard as Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Hospital, Doctor, EmergencyRequest } from '../types/database';

interface HospitalDashboardProps {
  hospital: Hospital;
  onLogout: () => void;
}

export default function HospitalDashboard({ hospital, onLogout }: HospitalDashboardProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialization: '' });
  const [loading, setLoading] = useState(false);

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('hospital_id', hospital.id);

      if (error) throw error;
      setDoctors(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEmergencies = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_request')
        .select(`
          *,
          patients (patient_name, email, phone)
        `)
        .eq('hospital_id', hospital.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmergencies(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDoctors();
    loadEmergencies();
    const interval = setInterval(() => {
      loadDoctors();
      loadEmergencies();
    }, 5000);
    return () => clearInterval(interval);
  }, [hospital.id]);

  const handleAddDoctor = async () => {
    if (!newDoctor.name.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('doctors')
        .insert({
          hospital_id: hospital.id,
          doctor_name: newDoctor.name,
          specialization: newDoctor.specialization,
          status: 'ABSENT',
        });

      if (error) throw error;

      setNewDoctor({ name: '', specialization: '' });
      setShowAddDoctor(false);
      loadDoctors();
    } catch (err) {
      console.error(err);
      alert('Failed to add doctor');
    }
    setLoading(false);
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!confirm('Are you sure you want to remove this doctor?')) return;

    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId);

      if (error) throw error;
      loadDoctors();
    } catch (err) {
      console.error(err);
      alert('Failed to delete doctor');
    }
  };

  const handleDoctorStatusChange = async (doctorId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };

      if (newStatus === 'AVAILABLE' || newStatus === 'BUSY' || newStatus === 'ON_BREAK') {
        updates.login_time = new Date().toISOString();
      } else if (newStatus === 'ABSENT') {
        updates.logout_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('doctors')
        .update(updates)
        .eq('id', doctorId);

      if (error) throw error;
      loadDoctors();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleAcceptEmergency = async (emergencyId: string, doctorId: string) => {
    setLoading(true);
    try {
      const { error: emergencyError } = await supabase
        .from('emergency_request')
        .update({
          status: 'ACCEPTED',
          doctor_id: doctorId,
          updated_at: new Date().toISOString()
        })
        .eq('id', emergencyId);

      if (emergencyError) throw emergencyError;

      const { error: doctorError } = await supabase
        .from('doctors')
        .update({ status: 'BUSY' })
        .eq('id', doctorId);

      if (doctorError) throw doctorError;

      const doctor = doctors.find(d => d.id === doctorId);
      await supabase
        .from('emergency_activity_log')
        .insert({
          emergency_id: emergencyId,
          activity_type: 'ACCEPTED',
          description: `Emergency accepted by Dr. ${doctor?.doctor_name}`,
          created_by: doctor?.doctor_name || 'Doctor',
        });

      loadEmergencies();
      loadDoctors();
    } catch (err) {
      console.error(err);
      alert('Failed to accept emergency');
    }
    setLoading(false);
  };

  const handleRejectEmergency = async (emergencyId: string) => {
    if (!confirm('Are you sure you want to reject this emergency?')) return;

    try {
      const { error } = await supabase
        .from('emergency_request')
        .delete()
        .eq('id', emergencyId);

      if (error) throw error;

      await supabase
        .from('emergency_activity_log')
        .insert({
          emergency_id: emergencyId,
          activity_type: 'REJECTED',
          description: 'Emergency request rejected by hospital',
          created_by: hospital.hospital_name,
        });

      loadEmergencies();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteEmergency = async (emergencyId: string, doctorId: string | null) => {
    if (!confirm('Mark this emergency as completed?')) return;

    try {
      const { error: emergencyError } = await supabase
        .from('emergency_request')
        .update({
          status: 'COMPLETED',
          updated_at: new Date().toISOString()
        })
        .eq('id', emergencyId);

      if (emergencyError) throw emergencyError;

      if (doctorId) {
        await supabase
          .from('doctors')
          .update({ status: 'AVAILABLE' })
          .eq('id', doctorId);
      }

      await supabase
        .from('emergency_activity_log')
        .insert({
          emergency_id: emergencyId,
          activity_type: 'COMPLETED',
          description: 'Emergency completed successfully',
          created_by: hospital.hospital_name,
        });

      loadEmergencies();
      loadDoctors();
    } catch (err) {
      console.error(err);
      alert('Failed to complete emergency');
    }
  };

  const stats = {
    totalDoctors: doctors.length,
    available: doctors.filter(d => d.status === 'AVAILABLE').length,
    busy: doctors.filter(d => d.status === 'BUSY').length,
    activeEmergencies: emergencies.filter(e => e.status !== 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Hospital Dashboard</h1>
            <p className="text-purple-300 text-sm">{hospital.hospital_name}</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalDoctors}</p>
                <p className="text-sm text-slate-300">Total Doctors</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.available}</p>
                <p className="text-sm text-slate-300">Available</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-lg border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.busy}</p>
                <p className="text-sm text-slate-300">Busy</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-lg border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.activeEmergencies}</p>
                <p className="text-sm text-slate-300">Active Emergencies</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-slate-800/80 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-400" />
                Doctors Management
              </h2>
              <button
                onClick={() => setShowAddDoctor(!showAddDoctor)}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg transition-all text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Doctor
              </button>
            </div>

            {showAddDoctor && (
              <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 mb-4">
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 mb-2"
                  placeholder="Doctor name"
                />
                <input
                  type="text"
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 mb-2"
                  placeholder="Specialization"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddDoctor}
                    disabled={loading}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddDoctor(false)}
                    className="px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-white">{doctor.doctor_name}</p>
                      <p className="text-sm text-slate-400">{doctor.specialization || 'General'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {['AVAILABLE', 'BUSY', 'ON_BREAK', 'ABSENT'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleDoctorStatusChange(doctor.id, status)}
                        className={`text-xs px-3 py-1 rounded transition-all ${
                          doctor.status === status
                            ? status === 'AVAILABLE'
                              ? 'bg-green-500 text-white'
                              : status === 'BUSY'
                              ? 'bg-red-500 text-white'
                              : status === 'ON_BREAK'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-slate-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {doctors.length === 0 && (
                <p className="text-slate-400 text-center py-8">No doctors added yet</p>
              )}
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-lg border border-orange-500/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-400" />
              Emergency Notifications
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {emergencies.map((emergency: any) => (
                <div
                  key={emergency.id}
                  className={`border rounded-lg p-4 ${
                    emergency.status === 'NEW'
                      ? 'bg-orange-500/10 border-orange-500/50'
                      : emergency.status === 'ACCEPTED'
                      ? 'bg-blue-500/10 border-blue-500/50'
                      : 'bg-green-500/10 border-green-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-white text-lg">{emergency.emergency_type}</p>
                      <p className="text-sm text-slate-300">{emergency.description}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        emergency.status === 'NEW'
                          ? 'bg-orange-500 text-white'
                          : emergency.status === 'ACCEPTED'
                          ? 'bg-blue-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {emergency.status}
                    </span>
                  </div>

                  <div className="bg-slate-900/50 rounded p-2 mb-3 text-sm">
                    <p className="text-slate-300">
                      <strong>Patient:</strong> {emergency.patients?.patient_name}
                    </p>
                    <p className="text-slate-300">
                      <strong>Contact:</strong> {emergency.patients?.phone || emergency.patients?.email}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {new Date(emergency.created_at).toLocaleString()}
                    </p>
                  </div>

                  {emergency.status === 'NEW' && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300 mb-1">Assign to doctor:</p>
                      <div className="flex gap-2 flex-wrap">
                        {doctors
                          .filter(d => d.status === 'AVAILABLE')
                          .map((doctor) => (
                            <button
                              key={doctor.id}
                              onClick={() => handleAcceptEmergency(emergency.id, doctor.id)}
                              disabled={loading}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2 rounded transition-colors disabled:opacity-50"
                            >
                              Dr. {doctor.doctor_name}
                            </button>
                          ))}
                      </div>
                      {doctors.filter(d => d.status === 'AVAILABLE').length === 0 && (
                        <p className="text-sm text-yellow-400">No available doctors</p>
                      )}
                      <button
                        onClick={() => handleRejectEmergency(emergency.id)}
                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded transition-colors text-sm border border-red-500/30"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {emergency.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleCompleteEmergency(emergency.id, emergency.doctor_id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition-colors text-sm"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}
              {emergencies.length === 0 && (
                <p className="text-slate-400 text-center py-8">No emergency requests</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
