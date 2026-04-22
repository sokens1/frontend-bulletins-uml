'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Award,
  ChevronRight,
  FileText
} from 'lucide-react';
import { gradesService, academicService } from '../../../services/api';

export default function PromotionSummary() {
  const [stats, setStats] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const structure = await academicService.getStructure();
      if (structure && structure.length > 0) {
        setSemesters(structure);
        setSelectedSemester(structure[0].id);
        fetchPromotionData(structure[0].id);
      }
    } catch (err) {
      console.error("Error fetching semesters:", err);
    }
  };

  const fetchPromotionData = async (semesterId: string) => {
    try {
      setLoading(true);
      const data = await gradesService.getPromotionStats(semesterId);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterChange = (id: string) => {
    setSelectedSemester(id);
    fetchPromotionData(id);
  };

  const handleDownloadBulletin = async (studentId: string, name: string) => {
    try {
      setDownloadingId(studentId);
      const blob = await gradesService.downloadBulletin(studentId, selectedSemester);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin_${name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Erreur lors du téléchargement du bulletin.");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredResults = stats?.studentResults?.filter((r: any) => 
    r.student.lastName.toLowerCase().includes(search.toLowerCase()) ||
    r.student.firstName.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-primary w-8 h-8" />
            Suivi de Promotion
          </h1>
          <p className="text-slate-400 text-sm font-medium">Vue d'ensemble des performances académiques et décisions de jury.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
             {semesters.map(sem => (
               <button
                 key={sem.id}
                 onClick={() => handleSemesterChange(sem.id)}
                 className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                   selectedSemester === sem.id 
                   ? 'bg-white text-primary shadow-sm' 
                   : 'text-slate-500 hover:text-slate-800'
                 }`}
               >
                 {sem.name}
               </button>
             ))}
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
             <FileSpreadsheet size={18} />
             Exporter Excel
          </button>
        </div>
      </div>

      {stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <StatCard 
               label="Moyenne de Classe" 
               value={stats.classAverage} 
               suffix="/20" 
               icon={<TrendingUp className="text-emerald-500" />} 
               trend="Global"
             />
             <StatCard 
               label="Moyenne Max" 
               value={stats.max} 
               suffix="/20" 
               icon={<Award className="text-amber-500" />} 
               trend="Major"
             />
             <StatCard 
               label="Moyenne Min" 
               value={stats.min} 
               suffix="/20" 
               icon={<TrendingDown className="text-red-500" />} 
               trend="Seuil"
             />
             <StatCard 
               label="Étudiants Evalués" 
               value={stats.count} 
               suffix="" 
               icon={<Users className="text-blue-500" />} 
               trend="Inscrits"
             />
          </div>

          {/* Results Table */}
          <div className="glass-card overflow-hidden border-white/40 shadow-2xl">
            <div className="p-6 border-b border-white/20 bg-white/40 flex items-center justify-between gap-4">
               <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Rechercher un étudiant..."
                   className="w-full bg-white/60 border-2 border-white/80 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
               </div>
               <div className="flex items-center gap-2">
                 <button className="glass-card p-2 text-slate-400 hover:text-primary transition-all rounded-xl border-white/60">
                    <Filter size={18} />
                 </button>
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-white text-[10px] uppercase tracking-widest text-slate-400 font-black">
                    <th className="px-6 py-5">Étudiant</th>
                    <th className="px-6 py-5">Crédits (V/E)</th>
                    <th className="px-6 py-5">Moyenne</th>
                    <th className="px-6 py-5">Décision</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="p-20 text-center"><div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></td></tr>
                  ) : filteredResults.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-medium tracking-tight">Aucune donnée disponible pour ce semestre.</td></tr>
                  ) : (
                    filteredResults.map((res: any, idx: number) => (
                      <tr key={idx} className="border-b border-white/10 hover:bg-white/50 transition-all group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase border-2 border-white">
                                {res.student.lastName[0]}{res.student.firstName[0]}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold text-slate-800">{res.student.lastName} {res.student.firstName}</span>
                                 <span className="text-[10px] text-slate-400 font-medium">Rang: {res.rank} / {stats.count}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <span className={`text-sm font-black ${res.totalCreditsWon >= 30 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {res.totalCreditsWon}
                              </span>
                              <span className="text-[10px] text-slate-300 font-bold">/ 30</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-sm font-black p-2 rounded-xl border-white ${
                             res.semesterAverage >= 12 ? 'text-emerald-600 bg-emerald-50 border' : 
                             res.semesterAverage >= 10 ? 'text-blue-600 bg-blue-50 border' : 
                             'text-red-600 bg-red-50 border'
                           }`}>
                             {res.semesterAverage.toFixed(2)}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full ${
                             res.semesterAverage >= 10 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                           }`}>
                             {res.status}
                           </span>
                        </td>
                         <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDownloadBulletin(res.student.id, `${res.student.lastName} ${res.student.firstName}`)}
                              disabled={downloadingId === res.student.id}
                              className={`p-2 rounded-xl transition-all ${
                                downloadingId === res.student.id 
                                ? 'bg-slate-100 text-slate-300 animate-pulse' 
                                : 'hover:bg-primary/10 text-slate-400 hover:text-primary'
                              }`}
                              title="Télécharger Bulletin PDF"
                            >
                               <FileText size={18} />
                            </button>
                            <button 
                              onClick={() => window.location.href = `/dashboard/admin/students?search=${res.student.lastName}`}
                              className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-xl transition-all"
                              title="Voir fiche étudiant"
                            >
                               <ChevronRight size={18} />
                            </button>
                         </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, suffix, icon, trend }: { label: string, value: any, suffix: string, icon: any, trend: string }) {
  return (
    <div className="glass-card p-6 border-white/50 bg-white/40 shadow-xl flex flex-col gap-4">
       <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-50">
             {icon}
          </div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{trend}</span>
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          <h3 className="text-2xl font-black text-slate-800">
            {value} <span className="text-sm font-medium text-slate-400">{suffix}</span>
          </h3>
       </div>
    </div>
  );
}
