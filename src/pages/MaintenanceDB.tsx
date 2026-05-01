import { useState, useEffect } from 'react';
import { supabase, tables } from '../lib/supabase';
import { Wrench, Plus, Building, Phone, MapPin, Search, Pencil, Trash2 } from 'lucide-react';

export default function MaintenanceDB() {
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    equipment: 'General Machinery',
    phone: '',
    address: '',
    notes: ''
  });

  const EQUIPMENTS = [
    'General Machinery',
    'CNC metal repair',
    'Electrical Systems',
    'HVAC Maintenance',
    'Other'
  ];

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    const { data, error } = await supabase.from(tables.MAINTENANCE).select('*').order('name', { ascending: true });
    if (data) setMaintenance(data);
    if (error) console.error(error);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from(tables.MAINTENANCE).update(formData).eq('id', editingId);
      if (!error) {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', phone: '', address: '', equipment: 'General Machinery', notes: '' });
        fetchMaintenance();
      } else {
        alert("Error updating maintenance record: " + error.message);
      }
    } else {
      const { error } = await supabase.from(tables.MAINTENANCE).insert([formData]);
      if (!error) {
        setIsAdding(false);
        setFormData({ name: '', phone: '', address: '', equipment: 'General Machinery', notes: '' });
        fetchMaintenance();
      } else {
        alert("Error adding maintenance record: " + error.message);
      }
    }
  };

  const handleEdit = (m: any) => {
    setFormData({
      name: m.name || '',
      phone: m.phone || '',
      address: m.address || '',
      equipment: m.equipment || '',
      notes: m.notes || ''
    });
    setEditingId(m.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this maintenance record?")) {
      const { error } = await supabase.from(tables.MAINTENANCE).delete().eq('id', id);
      if (!error) fetchMaintenance();
      else alert("Error deleting maintenance record: " + error.message);
    }
  };

  const filtered = maintenance.filter(m => {
    const matchesSearch = m.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterCategory ? m.equipment === filterCategory : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center tracking-tight">
            <Wrench className="mr-3 text-amber-500" size={32} /> Maintenance DB
          </h2>
          <p className="text-slate-400 mt-1 font-medium">Equipment contractors, repair shops, and maintenance partners.</p>
        </div>
        <button onClick={() => { setIsAdding(!isAdding); setEditingId(null); setFormData({ name: '', phone: '', address: '', equipment: 'General Machinery', notes: '' }); }} className="flex items-center px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
          <Plus className="mr-2" size={20} /> Add Provider
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
          <input 
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-medium backdrop-blur-sm"
          />
        </div>
        <div className="relative md:w-72">
          <select 
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-medium backdrop-blur-sm cursor-pointer"
          >
            <option value="">All Equipment/Categories</option>
            {EQUIPMENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateOrUpdate} className="financial-card p-6 mb-8 border-amber-500/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entity Name</label>
               <input required className="financial-input w-full focus:border-amber-500/50 focus:ring-amber-500/50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="TechRepair Ltd..." />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Equipment / Category</label>
               <select className="financial-input w-full focus:border-amber-500/50 focus:ring-amber-500/50" value={formData.equipment} onChange={e => setFormData({...formData, equipment: e.target.value})}>
                 {EQUIPMENTS.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
               <input className="financial-input w-full focus:border-amber-500/50 focus:ring-amber-500/50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 8900" />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Address</label>
               <input className="financial-input w-full focus:border-amber-500/50 focus:ring-amber-500/50" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="789 Service Rd..." />
             </div>
             <div className="md:col-span-2 space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Internal Notes</label>
               <textarea className="financial-input w-full min-h-[100px] focus:border-amber-500/50 focus:ring-amber-500/50" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Service history, specialization..." />
             </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-800/60">
             <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-6 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
             <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">{editingId ? 'Update Record' : 'Save Record'}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map(m => (
          <div key={m.id} className="financial-card group hover:border-amber-500/30 transition-all duration-300">
             <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-900/30 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                    <Building size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{m.name}</h3>
                    <p className="text-sm font-medium text-amber-500 mt-1">{m.equipment}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mb-3">
                  <button onClick={() => handleEdit(m)} className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
                  <div className="flex items-center text-sm">
                    <Phone size={14} className="text-slate-500 mr-3 shrink-0" />
                    <span className="text-slate-300 font-medium">{m.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin size={14} className="text-slate-500 mr-3 shrink-0" />
                    <span className="text-slate-300 font-medium">{m.address || 'N/A'}</span>
                  </div>
                </div>

                {m.notes && (
                  <div className="mt-4 text-sm text-slate-400 bg-slate-800/30 p-4 rounded-xl border-l-2 border-amber-500/50 italic">
                    "{m.notes}"
                  </div>
                )}
             </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-slate-900/30 rounded-[20px] border border-dashed border-slate-700/50">No maintenance partners found.</div>}
      </div>
    </div>
  );
}
