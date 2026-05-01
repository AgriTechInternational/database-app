import { useState, useEffect } from 'react';
import { supabase, tables } from '../lib/supabase';
import { Briefcase, Plus, UserCircle, Phone, MapPin, Search, Filter, Pencil, Trash2 } from 'lucide-react';

export default function BrokersDB() {
  const [brokers, setBrokers] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const CATEGORIES = [
    'Machine Sale',
    'Factory Rent',
    'Raw Material Procurement'
  ];

  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    phone: '',
    address: '',
    speciality: '',
    notes: ''
  });

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    const { data, error } = await supabase.from(tables.BROKERS).select('*').order('name', { ascending: true });
    if (data) setBrokers(data);
    if (error) console.error(error);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from(tables.BROKERS).update(formData).eq('id', editingId);
      if (!error) {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', category: CATEGORIES[0], phone: '', address: '', speciality: '', notes: '' });
        fetchBrokers();
      } else {
        alert("Error updating broker: " + error.message);
      }
    } else {
      const { error } = await supabase.from(tables.BROKERS).insert([formData]);
      if (!error) {
        setIsAdding(false);
        setFormData({ name: '', category: CATEGORIES[0], phone: '', address: '', speciality: '', notes: '' });
        fetchBrokers();
      } else {
        alert("Error adding broker: " + error.message);
      }
    }
  };

  const handleEdit = (b: any) => {
    setFormData({
      name: b.name || '',
      category: b.category || CATEGORIES[0],
      phone: b.phone || '',
      address: b.address || '',
      speciality: b.speciality || '',
      notes: b.notes || ''
    });
    setEditingId(b.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this broker?")) {
      const { error } = await supabase.from(tables.BROKERS).delete().eq('id', id);
      if (!error) fetchBrokers();
      else alert("Error deleting broker: " + error.message);
    }
  };

  const filtered = brokers.filter(b => {
    const matchesSearch = b.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterCategory ? b.category === filterCategory : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center tracking-tight">
            <UserCircle className="mr-3 text-purple-500" size={32} /> Brokers Database
          </h2>
          <p className="text-slate-400 mt-1 font-medium">Intermediaries for machine sales, factory rentals, and deals.</p>
        </div>
        <button onClick={() => { setIsAdding(!isAdding); setEditingId(null); setFormData({ name: '', category: CATEGORIES[0], phone: '', address: '', speciality: '', notes: '' }); }} className="flex items-center px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
          <Plus className="mr-2" size={20} /> Add Broker
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
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium backdrop-blur-sm"
          />
        </div>
        <div className="relative md:w-72">
          <Filter className="absolute left-4 top-3.5 text-slate-500" size={20} />
          <select 
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white appearance-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium backdrop-blur-sm cursor-pointer"
          >
            <option value="">All Broker Groups</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateOrUpdate} className="financial-card p-6 mb-8 border-purple-500/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Broker Name</label>
               <input required className="financial-input w-full focus:border-purple-500/50 focus:ring-purple-500/50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Broker firm or individual..." />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Broker Group</label>
               <select className="financial-input w-full focus:border-purple-500/50 focus:ring-purple-500/50" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                 {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
               <input className="financial-input w-full focus:border-purple-500/50 focus:ring-purple-500/50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 8900" />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Address</label>
               <input className="financial-input w-full focus:border-purple-500/50 focus:ring-purple-500/50" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Corporate address..." />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Speciality</label>
               <input className="financial-input w-full focus:border-purple-500/50 focus:ring-purple-500/50" value={formData.speciality} onChange={e => setFormData({...formData, speciality: e.target.value})} placeholder="e.g. Lathe Machines" />
             </div>
             <div className="md:col-span-2 space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Internal Notes</label>
               <textarea className="financial-input w-full min-h-[100px] focus:border-purple-500/50 focus:ring-purple-500/50" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Commission rates, past deals..." />
             </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-800/60">
             <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-6 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
             <button type="submit" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">{editingId ? 'Update Record' : 'Save Record'}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map(b => (
          <div key={b.id} className="financial-card group hover:border-purple-500/30 transition-all duration-300">
             <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-900/30 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{b.name}</h3>
                    <div className="flex items-center mt-0.5 text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 w-fit">
                      {b.category}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
                  <div className="flex items-center text-sm">
                    <Phone size={14} className="text-slate-500 mr-3 shrink-0" />
                    <span className="text-slate-300 font-medium">{b.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin size={14} className="text-slate-500 mr-3 shrink-0" />
                    <span className="text-slate-300 font-medium">{b.address || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-[14px] mr-3 shrink-0"></div>
                    <p className="text-sm font-medium text-slate-400">Spec: {b.speciality || 'N/A'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 mt-4">
                  <button onClick={() => handleEdit(b)} className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>

                {b.notes && (
                  <div className="mt-4 text-sm text-slate-400 bg-slate-800/30 p-4 rounded-xl border-l-2 border-purple-500/50 italic">
                    "{b.notes}"
                  </div>
                )}
             </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-slate-900/30 rounded-[20px] border border-dashed border-slate-700/50">No brokers found.</div>}
      </div>
    </div>
  );
}
