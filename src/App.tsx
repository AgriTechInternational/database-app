import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Database, Users, Package, Wrench, Handshake, ChevronLeft } from 'lucide-react';
import CustomersDB from './pages/CustomersDB';
import MaterialsDB from './pages/MaterialsDB';
import MaintenanceDB from './pages/MaintenanceDB';
import BrokersDB from './pages/BrokersDB';

function Dashboard() {
  const navigate = useNavigate();
  
  const modules = [
    { id: 'customers', title: 'Customers', icon: Users, path: '/customers', color: 'bg-blue-600', hoverColor: 'hover:bg-blue-500', glow: 'shadow-blue-900/30' },
    { id: 'materials', title: 'Materials', icon: Package, path: '/materials', color: 'bg-emerald-600', hoverColor: 'hover:bg-emerald-500', glow: 'shadow-emerald-900/30' },
    { id: 'maintenance', title: 'Maintenance', icon: Wrench, path: '/maintenance', color: 'bg-amber-600', hoverColor: 'hover:bg-amber-500', glow: 'shadow-amber-900/30' },
    { id: 'brokers', title: 'Brokers', icon: Handshake, path: '/brokers', color: 'bg-purple-600', hoverColor: 'hover:bg-purple-500', glow: 'shadow-purple-900/30' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center justify-center text-white">
          <Database className="mr-4 text-blue-400" size={40} /> Global Database Hub
        </h1>
        <p className="text-slate-400 font-medium text-lg">Unified command center for all external entities and assets.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
        {modules.map(mod => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => navigate(mod.path)}
              className={`group flex flex-col items-center justify-center aspect-square rounded-[32px] border border-slate-700/50 ${mod.color} bg-opacity-10 backdrop-blur-md shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ${mod.glow}`}
            >
              <div className={`p-6 rounded-2xl ${mod.color} mb-6 transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
                <Icon size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-wide">{mod.title}</h2>
              <p className="text-slate-400 text-sm mt-4 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                Access Database <ChevronLeft className="ml-1 rotate-180" size={16} />
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-200 selection:bg-blue-500/30">
      {/* Global Header */}
      {!isDashboard && (
        <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="mr-4 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all active:scale-95 border border-slate-700 hover:border-slate-600 shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-white flex items-center tracking-tight">
              <Database size={22} className="mr-2.5 text-blue-400" /> Database Hub
            </h1>
          </div>
        </header>
      )}

      <main className={!isDashboard ? "p-6 max-w-7xl mx-auto" : ""}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<CustomersDB />} />
          <Route path="/materials" element={<MaterialsDB />} />
          <Route path="/maintenance" element={<MaintenanceDB />} />
          <Route path="/brokers" element={<BrokersDB />} />
        </Routes>
      </main>
    </div>
  );
}
