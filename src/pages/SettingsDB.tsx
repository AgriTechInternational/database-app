import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Users, Trash2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function SettingsDB({ user, onBack, role }: { user: any, onBack: () => void, role: string }) {
  const [activeTab, setActiveTab] = useState('SECURITY');
  const [pendingCount, setPendingCount] = useState(0);
  const isSuper = role === 'SUPER_USER' || role === 'SUPER_ADMIN';
  const isAdmin = role === 'admin' || role === 'ADMIN' || isSuper;

  useEffect(() => {
    if (isSuper) {
      supabase.from('profiles').select('id', { count: 'exact' }).or('is_delete_pending.eq.true,pending_role.not.is.null')
        .then(({ count }) => setPendingCount(count || 0));
    }
  }, [user, isSuper]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 hover:border-slate-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
            <p className="text-slate-400 text-sm font-medium">Manage access and security protocols</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/30 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('SECURITY')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'SECURITY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Shield size={18} />
            <span>Security Center</span>
          </button>
          
          {(isAdmin || isSuper) && (
            <button 
              onClick={() => setActiveTab('AUTHORIZE')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'AUTHORIZE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <Users size={18} />
              <span>Authorize Log</span>
            </button>
          )}

          {isSuper && (
            <button 
              onClick={() => setActiveTab('REQUESTS')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'REQUESTS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <div className="flex items-center space-x-3">
                <Shield size={18} />
                <span>Requests Hub</span>
              </div>
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'SECURITY' && <SecurityCenter user={user} />}
          {activeTab === 'AUTHORIZE' && (isAdmin || isSuper) && <AuthorizeLog role={role} onRefresh={() => {
            // update count on changes
            supabase.from('profiles').select('id', { count: 'exact' }).or('is_delete_pending.eq.true,pending_role.not.is.null')
              .then(({ count }) => setPendingCount(count || 0));
          }} />}
          {activeTab === 'REQUESTS' && isSuper && <RequestsHub onRefresh={() => {
             supabase.from('profiles').select('id', { count: 'exact' }).or('is_delete_pending.eq.true,pending_role.not.is.null')
              .then(({ count }) => setPendingCount(count || 0));
          }} />}
        </div>
      </div>
    </div>
  );
}

function SecurityCenter({ user }: { user: any }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) return alert("Security: Password must be at least 6 characters.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      alert("Error updating password: " + error.message);
    } else {
      alert("Security credential successfully updated.");
      setNewPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 text-blue-500 mb-6">
        <Shield size={24} />
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Security Protocol</h2>
      </div>
      
      <div className="financial-card p-6 border-slate-700/50">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Self-Service Credential Authority</h3>
        <p className="text-slate-300 text-sm mb-6">Establish a new secure password for your account ({user.email}).</p>
        
        <div className="space-y-4">
          <input 
            type="password" 
            placeholder="New Password (min 6 characters)" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="financial-input w-full"
          />
          <button 
            onClick={handleChangePassword}
            disabled={loading || !newPassword}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
          >
            {loading ? 'Processing...' : 'Authorize Credential Change'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AuthorizeLog({ role, onRefresh }: { role: string, onRefresh: () => void }) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isSuper = role === 'SUPER_USER' || role === 'SUPER_ADMIN';

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setProfiles(data);
    setLoading(false);
  }

  async function updateRole(userId: string, targetEmail: string, newRole: string) {
    if (newRole === 'PENDING' && !isSuper) {
      return alert("Only Super Admins can revoke access.");
    }
    
    if (isSuper) {
      const { error } = await supabase.from("profiles").update({ role: newRole, pending_role: null }).eq("id", userId);
      if (!error) {
        fetchProfiles();
        onRefresh();
      }
      else alert("Error: " + error.message);
    } else {
      // ...
      const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (currentProfile?.role === 'PENDING' && newRole === 'ENGINEER') {
        const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
        if (!error) {
          fetchProfiles();
          onRefresh();
        }
      } else {
        const { error } = await supabase.from("profiles").update({ pending_role: newRole }).eq("id", userId);
        if (!error) {
          alert(`Request submitted. A Super User must approve this role change for ${targetEmail}.`);
          fetchProfiles();
          onRefresh();
        }
      }
    }
  }

  const deleteProfile = async (userId: string, targetEmail: string) => {
    if (isSuper) {
      if (!window.confirm(`Permanently delete profile for ${targetEmail}?`)) return;
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (!error) {
        fetchProfiles();
        onRefresh();
      }
      else alert("Error: " + error.message);
    } else {
      const { error } = await supabase.from('profiles').update({ is_delete_pending: true }).eq('id', userId);
      if (!error) {
        alert("Purge Request submitted. A Super User must approve.");
        fetchProfiles();
        onRefresh();
      }
    }
  };

  if (loading) return <div className="text-slate-400 flex items-center"><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div> Loading personnel data...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 text-blue-500 mb-6">
        <Users size={24} />
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Personnel Authorization Log</h2>
      </div>

      <div className="financial-card overflow-hidden border-slate-700/50 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Identity</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Clearance</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {profiles.map((p) => {
                if (p.role === 'SUPER_USER' && !isSuper) return null;
                
                return (
                  <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200">{p.full_name || 'Anonymous'}</div>
                      <div className="text-xs text-slate-500">{p.email || p.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        p.role === 'SUPER_USER' || p.role === 'SUPER_ADMIN' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' :
                        p.role === 'ADMIN' || p.role === 'admin' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' :
                        p.role === 'ENGINEER' ? 'bg-teal-900/30 text-teal-400 border-teal-500/30' :
                        'bg-amber-900/30 text-amber-400 border-amber-500/30'
                      }`}>
                        {p.role || 'PENDING'}
                      </div>
                      {p.pending_role && <span className="ml-2 text-[9px] font-black text-blue-400 uppercase">[{p.pending_role} Requested]</span>}
                      {p.is_delete_pending && <span className="ml-2 text-[9px] font-black text-red-400 uppercase">[Purge Requested]</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <select 
                          value={p.role || 'PENDING'} 
                          onChange={(e) => updateRole(p.id, p.email, e.target.value)}
                          disabled={!isSuper && (p.role === 'ADMIN' || p.role === 'admin')}
                          className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1.5 rounded-lg text-xs font-bold uppercase disabled:opacity-50 outline-none focus:border-blue-500 transition-colors"
                        >
                          <option value="PENDING">REVOKE ACCESS</option>
                          <option value="ENGINEER">ENGINEER</option>
                          <option value="admin">ADMIN</option>
                          {isSuper && <option value="SUPER_USER">SUPER USER</option>}
                        </select>
                        <button 
                          onClick={() => deleteProfile(p.id, p.email)}
                          className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                          title="Purge Profile"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RequestsHub({ onRefresh }: { onRefresh: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').or('is_delete_pending.eq.true,pending_role.not.is.null');
    if (data) setItems(data);
    setLoading(false);
  }

  async function approve(p: any) {
    try {
      console.log("[Auth] Approving request for:", p.email);
      let error;
      if (p.is_delete_pending) {
        if (!window.confirm(`APPROVE PURGE for ${p.email}?`)) return;
        const result = await supabase.from('profiles').delete().eq('id', p.id);
        error = result.error;
      } else {
        const result = await supabase.from('profiles').update({ role: p.pending_role, pending_role: null }).eq('id', p.id);
        error = result.error;
      }
      
      if (error) {
        console.error("[Auth] Approval Error:", error);
        alert("Authorization Error: " + error.message);
      } else {
        console.log("[Auth] Success. Refreshing list...");
        alert("Protocol Approved: Access has been granted to " + p.email);
        setItems(prev => prev.filter(item => item.id !== p.id));
        onRefresh();
      }
    } catch (err: any) {
      alert("System Error: " + err.message);
    }
  }

  async function reject(p: any) {
    try {
      const { error } = await supabase.from('profiles').update({ is_delete_pending: false, pending_role: null }).eq('id', p.id);
      if (error) alert("Error: " + error.message);
      else {
        setItems(prev => prev.filter(item => item.id !== p.id));
        onRefresh();
      }
    } catch (err: any) {
      alert("System Error: " + err.message);
    }
  }

  if (loading) return <div className="text-slate-400">Loading requests...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 text-blue-500">
          <Shield size={24} />
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Requests Hub</h2>
        </div>
        <button 
          onClick={() => fetchRequests()}
          className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
        >
          Force Refresh Queue
        </button>
      </div>

      {items.length === 0 ? (
        <div className="financial-card p-12 text-center border-dashed border-slate-700">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No pending requests in queue</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(p => (
            <div key={p.id} className="financial-card p-6 flex items-center justify-between border-slate-700/50 bg-slate-900/40">
              <div>
                <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">
                  {p.is_delete_pending ? 'Purge Request' : `Promotion to ${p.pending_role}`}
                </div>
                <div className="font-bold text-slate-200">{p.email}</div>
                <div className="text-xs text-slate-500">Current Role: {p.role}</div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => approve(p)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center"
                >
                  <CheckCircle size={14} className="mr-2" /> Approve
                </button>
                <button 
                  onClick={() => reject(p)}
                  className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 text-xs font-bold rounded-lg transition-all flex items-center"
                >
                  <XCircle size={14} className="mr-2" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
