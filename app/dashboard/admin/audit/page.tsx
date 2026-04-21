'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Shield, 
  User, 
  Calendar, 
  Database, 
  Tag, 
  Eye,
  ArrowRight,
  Filter
} from 'lucide-react';
import { userService } from '../../../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await userService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user?.email.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (action.includes('UPDATE')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <History className="text-primary w-8 h-8" />
            Rapports d'Audit Sécutité
          </h1>
          <p className="text-slate-400 text-sm font-medium">Historique complet des modifications et accès sensibles.</p>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={fetchLogs}
             className="glass-card px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-primary transition-all border-white/60"
           >
             Actualiser
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logs Table */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           <div className="glass-card p-4 border-white/60 shadow-xl">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Rechercher une action, un utilisateur ou une entité..."
                   className="w-full bg-white/60 border-2 border-white/80 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
           </div>

           <div className="glass-card overflow-hidden border-white/40 shadow-2xl bg-white/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white text-[10px] uppercase tracking-widest text-slate-400 font-black">
                      <th className="px-6 py-5">Horodatage</th>
                      <th className="px-6 py-5">Utilisateur</th>
                      <th className="px-6 py-5">Action</th>
                      <th className="px-6 py-5">Entité</th>
                      <th className="px-6 py-5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                       <tr><td colSpan={5} className="p-20 text-center"><div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></td></tr>
                    ) : filteredLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        className={`group border-b border-white/10 hover:bg-white/60 cursor-pointer transition-all ${selectedLog?.id === log.id ? 'bg-primary/5' : ''}`}
                        onClick={() => setSelectedLog(log)}
                      >
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                               <span className="font-bold text-slate-700">{new Date(log.timestamp).toLocaleDateString()}</span>
                               <span className="text-[10px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black">{log.user?.role[0]}</div>
                               <span className="text-slate-600 font-semibold truncate max-w-[120px]">{log.user?.email.split('@')[0]}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border ${getActionColor(log.action)}`}>
                               {log.action}
                            </span>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-slate-400 font-bold tracking-tight text-[10px] uppercase">{log.entity}</span>
                         </td>
                         <td className="px-6 py-4 text-right">
                             <ArrowRight size={14} className={`text-primary transition-all ${selectedLog?.id === log.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

        {/* Log Detail Panel */}
        <div className="flex flex-col gap-6">
           <div className="glass-card p-8 border-white/60 shadow-2xl flex flex-col gap-8 min-h-[500px] sticky top-8 bg-gradient-to-br from-white/80 to-white/40">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                 <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <Shield size={24} />
                 </div>
                 <div>
                    <h3 className="font-black text-slate-800 text-lg tracking-tight">Détails de l'Action</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inspection Granulaire</p>
                 </div>
              </div>

              {selectedLog ? (
                <div className="flex flex-col gap-8 fade-in">
                   <div className="space-y-4">
                      <DetailRow icon={<User size={14}/>} label="Responsable" value={selectedLog.user?.email} />
                      <DetailRow icon={<Calendar size={14}/>} label="Date & Heure" value={new Date(selectedLog.timestamp).toLocaleString()} />
                      <DetailRow icon={<Tag size={14}/>} label="Type d'Opération" value={selectedLog.action} />
                      <DetailRow icon={<Database size={14}/>} label="Entité Cible" value={`${selectedLog.entity} (#${selectedLog.entityId?.substring(0,8)})`} />
                   </div>

                   <div className="flex flex-col gap-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Eye size={12} /> Données de l'opération
                      </p>
                      <div className="bg-slate-900 rounded-2xl p-6 overflow-auto max-h-[300px] shadow-inner">
                         <pre className="text-[11px] text-emerald-400 font-mono leading-relaxed">
                            {JSON.stringify(selectedLog.newData, null, 2)}
                         </pre>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-4 border-2 border-dashed border-slate-100 rounded-3xl">
                   <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                      <History size={32} />
                   </div>
                   <div>
                      <p className="text-slate-400 font-bold text-sm">Aucun log sélectionné</p>
                      <p className="text-xs text-slate-300">Cliquez sur une ligne du tableau pour inspecter les détails de la transaction.</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
       <div className="text-slate-400">{icon}</div>
       <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
          <span className="text-sm font-bold text-slate-600">{value}</span>
       </div>
    </div>
  );
}
