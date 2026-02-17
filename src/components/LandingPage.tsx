import { Heart, Activity } from 'lucide-react';

interface LandingPageProps {
  onPatientClick: () => void;
  onHospitalClick: () => void;
}

export default function LandingPage({ onPatientClick, onHospitalClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-50 rounded-full"></div>
            <div className="relative bg-gradient-to-br from-cyan-400 to-blue-600 p-4 rounded-2xl shadow-2xl">
              <Activity className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">RapidCare</h1>
            <p className="text-sm text-cyan-300">Emergency Response</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-3xl opacity-30"></div>
                <h1 className="relative text-7xl font-bold text-white mb-4">
                  RapidCare
                </h1>
              </div>
            </div>
          </div>

          <p className="text-2xl text-cyan-100 mb-4 font-light">
            Smart Emergency Response System
          </p>

          <p className="text-lg text-slate-300 mb-16 max-w-2xl mx-auto">
            Real-time communication between patients and hospitals for faster emergency response
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <button
              onClick={onPatientClick}
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-400/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Patient Interface</h3>
                <p className="text-slate-300 text-sm">Request emergency assistance from nearby hospitals</p>
              </div>
            </button>

            <button
              onClick={onHospitalClick}
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8 hover:border-purple-400/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Hospital Interface</h3>
                <p className="text-slate-300 text-sm">Manage doctors and respond to emergency requests</p>
              </div>
            </button>
          </div>

          <div className="mt-20 grid md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-cyan-400">1</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Quick Registration</h4>
              <p className="text-slate-400 text-sm">Patients and hospitals can register and access the system instantly</p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-cyan-400">2</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Real-Time Updates</h4>
              <p className="text-slate-400 text-sm">Instant notifications and status updates for emergency requests</p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-cyan-400">3</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Complete Tracking</h4>
              <p className="text-slate-400 text-sm">Full activity log and emergency status tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
