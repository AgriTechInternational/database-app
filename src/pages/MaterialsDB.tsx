import { useState, useEffect } from 'react';
import { supabase, tables } from '../lib/supabase';
import { Package, Plus, Building2, Phone, MapPin, Search, Hash } from 'lucide-react';

export default function MaterialsDB() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    company_name: '',
    material_number: '',
    phone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const { data, error } = await supabase.from(tables.MATERIALS).select('*').order('company_name', { ascending: true });
    if (data) setMaterials(data);
    if (error) console.error(error);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from(tables.MATERIALS).insert([formData]);
    if (!error) {
      setIsAdding(false);
      setFormData({ company_name: '', material_number: '', phone: '', address: '', notes: '' });
      fetchMaterials();
    } else {
      alert("Error adding material: " + error.message);
    }
  };

  const filtered = materials.filter(m => m.company_name?.toLowerCase().includes(search.toLowerCase()) || m.material_number?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center tracking-tight">
            <Package className="mr-3 text-emerald-500" size={32} /> Materials Database
          </h2>
          <p className="text-slate-400 mt-1 font-medium">Supply chain entities, vendor numbers, and operational details.</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
          <Plus className="mr-2" size={20} /> Add Supplier
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
        <input 
          type="text"
          placeholder="Search by company or material number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium backdrop-blur-sm"
        />
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="financial-card p-6 mb-8 border-emerald-500/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
               <input required className="financial-input w-full focus:border-emerald-500/50 focus:ring-emerald-500/50" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} placeholder="Global Synthetics..." />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Material / Vendor Number</label>
               <input required className="financial-input w-full focus:border-emerald-500/50 focus:ring-emerald-500/50" value={formData.material_number} onChange={e => setFormData({...formData, material_number: e.target.value})} placeholder="VND-8371..." />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
               <input className="financial-input w-full focus:border-emerald-500/50 focus:ring-emerald-500/50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 8900" />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Address</label>
               <input className="financial-input w-full focus:border-emerald-500/50 focus:ring-emerald-500/50" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="456 Resource Ave..." />
             </div>
             <div className="md:col-span-2 space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Internal Notes</label>
               <textarea className="financial-input w-full min-h-[100px] focus:border-emerald-500/50 focus:ring-emerald-500/50" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Lead times, minimum order quantities..." />
             </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-800/60">
             <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
             <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">Save Record</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map(m => (
          <div key={m.id} className="financial-card group hover:border-emerald-500/30 transition-all duration-300">
             <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{m.company_name}</h3>
                    <div className="flex items-center mt-0.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 w-fit">
                      <Hash size={12} className="mr-1" /> {m.material_number}
                    </div>
                  </div>
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
                  <div className="mt-4 text-sm text-slate-400 bg-slate-800/30 p-4 rounded-xl border-l-2 border-emerald-500/50 italic">
                    "{m.notes}"
                  </div>
                )}
             </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-slate-900/30 rounded-[20px] border border-dashed border-slate-700/50">No material suppliers found.</div>}
      </div>
    </div>
  );
}
