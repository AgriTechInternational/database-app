import { useState, useEffect } from 'react';
import { supabase, tables } from '../lib/supabase';
import { Users, Plus, Star, Building, Phone, MapPin, Search, Pencil, Trash2 } from 'lucide-react';

export default function CustomersDB() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    org_name: '',
    contact_person: '',
    phone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase.from(tables.CUSTOMERS).select('*').order('org_name', { ascending: true });
    if (data) setCustomers(data);
    if (error) console.error(error);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from(tables.CUSTOMERS).update(formData).eq('id', editingId);
      if (!error) {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ org_name: '', contact_person: '', phone: '', address: '', notes: '' });
        fetchCustomers();
      } else {
        alert("Error updating customer: " + error.message);
      }
    } else {
      const { error } = await supabase.from(tables.CUSTOMERS).insert([{ ...formData, stars: 0 }]);
      if (!error) {
        setIsAdding(false);
        setFormData({ org_name: '', contact_person: '', phone: '', address: '', notes: '' });
        fetchCustomers();
      } else {
        alert("Error adding customer: " + error.message);
      }
    }
  };

  const handleEdit = (customer: any) => {
    setFormData({
      org_name: customer.org_name || '',
      contact_person: customer.contact_person || '',
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setEditingId(customer.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      const { error } = await supabase.from(tables.CUSTOMERS).delete().eq('id', id);
      if (!error) fetchCustomers();
      else alert("Error deleting customer: " + error.message);
    }
  };

  const filtered = customers.filter(c => c.org_name?.toLowerCase().includes(search.toLowerCase()) || c.contact_person?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center tracking-tight">
            <Users className="mr-3 text-blue-500" size={32} /> Customers Database
          </h2>
          <p className="text-slate-400 mt-1 font-medium">Manage organizations, contacts, and recommendations.</p>
        </div>
        <button onClick={() => { setIsAdding(!isAdding); setEditingId(null); setFormData({ org_name: '', contact_person: '', phone: '', address: '', notes: '' }); }} className="flex items-center px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
          <Plus className="mr-2" size={20} /> Add Customer
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
        <input 
          type="text"
          placeholder="Search by organization or contact person..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium backdrop-blur-sm"
        />
      </div>

      {isAdding && (
        <form onSubmit={handleCreateOrUpdate} className="financial-card p-6 mb-8 border-blue-500/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Organization Name</label>
               <input required className="financial-input w-full" value={formData.org_name} onChange={e => setFormData({...formData, org_name: e.target.value})} placeholder="Acme Corp..." />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Person</label>
               <input required className="financial-input w-full" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} placeholder="John Doe..." />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
               <input className="financial-input w-full" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 8900" />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Address</label>
               <input className="financial-input w-full" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Industrial Blvd..." />
             </div>
             <div className="md:col-span-2 space-y-1.5">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Internal Notes</label>
               <textarea className="financial-input w-full min-h-[100px]" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Important details..." />
             </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-800/60">
             <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-6 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
             <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">{editingId ? 'Update Record' : 'Save Record'}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="financial-card group hover:border-blue-500/30 transition-all duration-300">
             <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-900/30 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                      <Building size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">{c.org_name}</h3>
                      <p className="text-sm font-medium text-slate-400">{c.contact_person}</p>
                    </div>
                  </div>
                   <div className="flex items-center space-x-1 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20" title="Auto-updated based on Finance App activity">
                     {Array.from({ length: Math.min(c.stars || 0, 5) }).map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />)}
                     {Array.from({ length: 5 - Math.min(c.stars || 0, 5) }).map((_, i) => <Star key={i} size={14} className="text-slate-700" />)}
                     <span className="ml-1.5 text-xs font-bold text-amber-500">{c.stars || 0}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end space-x-2 mb-3">
                  <button onClick={() => handleEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
                  <div className="flex items-center text-sm">
                    <Phone size={14} className="text-slate-500 mr-3 shrink-0" />
                    <span className="text-slate-300 font-medium">{c.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin size={14} className="text-slate-500 mr-3 shrink-0" />
                    <span className="text-slate-300 font-medium">{c.address || 'N/A'}</span>
                  </div>
                </div>

                {c.notes && (
                  <div className="mt-4 text-sm text-slate-400 bg-slate-800/30 p-4 rounded-xl border-l-2 border-blue-500/50 italic">
                    "{c.notes}"
                  </div>
                )}
             </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-slate-900/30 rounded-[20px] border border-dashed border-slate-700/50">No organizations found.</div>}
      </div>
    </div>
  );
}
