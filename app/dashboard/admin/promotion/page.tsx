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
  FileText,
  Calendar,
  Layers
} from 'lucide-react';
import { gradesService, academicService, exportService } from '../../../services/api';

export default function PromotionSummary() {
  const [stats, setStats] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'semester' | 'annual'>('semester');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const years = Array.from(new Set(semesters.map(s => s.year)));

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const structure = await academicService.getStructure() as any[];
      if (structure && structure.length > 0) {
        setSemesters(structure);
        setSelectedSemester(structure[0].id);
        setSelectedYear(structure[0].year);
        fetchSemesterPromotionData(structure[0].id);
      }
    } catch (err) {
      console.error("Error fetching semesters:", err);
    }
  };

  const fetchSemesterPromotionData = async (semesterId: string) => {
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

  const fetchAnnualPromotionData = async (year: string) => {
    try {
      setLoading(true);
      const data = await gradesService.getAnnualPromotionStats(year);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterChange = (id: string) => {
    setSelectedSemester(id);
    if (viewMode === 'semester') {
      fetchSemesterPromotionData(id);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (viewMode === 'annual') {
      fetchAnnualPromotionData(year);
    }
  };

  const toggleViewMode = (mode: 'semester' | 'annual') => {
    setViewMode(mode);
    if (mode === 'semester') {
      fetchSemesterPromotionData(selectedSemester || semesters[0]?.id);
    } else {
      fetchAnnualPromotionData(selectedYear || years[0]);
    }
  };

  const handleDownloadBulletin = async (studentId: string, name: string) => {
    try {
      setDownloadingId(studentId);
      let blob;
      let filename;
      
      if (viewMode === 'semester') {
        blob = await gradesService.downloadBulletin(studentId, selectedSemester);
        filename = `bulletin_${name.replace(/\s+/g, '_')}_${selectedSemester}.pdf`;
      } else {
        blob = await gradesService.downloadAnnualBulletin(studentId, selectedYear);
        filename = `bulletin_annuel_${name.replace(/\s+/g, '_')}_${selectedYear}.pdf`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
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

  const handleExportExcel = async () => {
    try {
      let blob;
      let filename;
      
      if (viewMode === 'semester') {
        if (!selectedSemester) return;
        blob = await exportService.downloadPromotionXlsx(selectedSemester);
        filename = `promotion_${selectedSemester}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      } else {
        if (!selectedYear) return;
        blob = await exportService.downloadAnnualPromotionXlsx(selectedYear);
        filename = `promotion_annuelle_${selectedYear.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors de l'export Excel.");
    }
  };

  const handleDownloadAllZip = async () => {
    try {
      let blob;
      let filename;

      if (viewMode === 'semester') {
        if (!selectedSemester) return;
        blob = await exportService.downloadAllBulletinsZip(selectedSemester);
        filename = `bulletins_semestre_${selectedSemester}_${new Date().toISOString().slice(0, 10)}.zip`;
      } else {
        if (!selectedYear) return;
        blob = await exportService.downloadAllAnnualBulletinsZip(selectedYear);
        filename = `bulletins_annuels_${selectedYear.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.zip`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors du téléchargement ZIP.");
    }
  };

  const filteredResults = stats?.studentResults?.filter((r: any) => {
    const lastName = r.student?.lastName?.toLowerCase?.() ?? '';
    const firstName = r.student?.firstName?.toLowerCase?.() ?? '';
    return lastName.includes(search.toLowerCase()) || firstName.includes(search.toLowerCase());
  }) || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-primary w-8 h-8" />
            Suivi de Promotion
          </h1>
          <p className="text-slate-400 text-sm font-medium">Vue d'ensemble des performances académiques et décisions de jury.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mr-4 border border-slate-200">
             <button
               onClick={() => toggleViewMode('semester')}
               className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                 viewMode === 'semester' 
                 ? 'bg-white text-primary shadow-sm' 
                 : 'text-slate-500 hover:text-slate-800'
               }`}
             >
               <Layers size={14} />
               Semestriel
             </button>
             <button
               onClick={() => toggleViewMode('annual')}
               className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                 viewMode === 'annual' 
                 ? 'bg-white text-primary shadow-sm' 
                 : 'text-slate-500 hover:text-slate-800'
               }`}
             >
               <Calendar size={14} />
               Annuel
             </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
             {viewMode === 'semester' ? (
                semesters.map(sem => (
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
                ))
             ) : (
                years.map(year => (
                  <button
                    key={year}
                    onClick={() => handleYearChange(year)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      selectedYear === year 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {year}
                  </button>
                ))
             )}
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'semester' && (
              <button
                onClick={handleExportExcel}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                 <FileSpreadsheet size={18} />
                 XLSX
              </button>
            )}
            <button
              onClick={handleDownloadAllZip}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
            >
              <FileText size={18} />
              ZIP {viewMode === 'annual' ? 'Annuel' : 'Bulletins'}
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <StatCard 
               label={`Moyenne ${viewMode === 'annual' ? 'Annuelle' : 'de Classe'}`} 
               value={stats.classAverage} 
               suffix="/20" 
               icon={<TrendingUp className="text-emerald-500" />} 
               trend="Global"
             />
             <StatCard 
               label="Major de Promotion" 
               value={stats.max} 
               suffix="/20" 
               icon={<Award className="text-amber-500" />} 
               trend="Max"
             />
             <StatCard 
               label="Seuil de Réussite" 
               value={stats.min} 
               suffix="/20" 
               icon={<TrendingDown className="text-red-500" />} 
               trend="Min"
             />
             <StatCard 
               label="Inscriptions Évaluées" 
               value={stats.count} 
               suffix="" 
               icon={<Users className="text-blue-500" />} 
               trend="Total"
             />
          </div>

          {/* Results Table */}
          <div className="glass-card overflow-hidden border-white/40 shadow-2xl">
            <div className="p-6 border-b border-white/20 bg-white/40 flex items-center justify-between gap-4">
               <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Filtrer par nom ou prénom..."
                   className="w-full bg-white/60 border-2 border-white/80 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
               </div>
               <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <Filter size={12} className="text-primary" />
                    Mode : <span className="text-primary">{viewMode === 'semester' ? 'Semestriel' : 'Annuel'}</span>
                  </div>
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-white text-[10px] uppercase tracking-widest text-slate-400 font-black">
                    <th className="px-6 py-5">Étudiant</th>
                    <th className="px-6 py-5">{viewMode === 'annual' ? 'Crédits Acquis' : 'Crédits (V/E)'}</th>
                    <th className="px-6 py-5">Moyenne {viewMode === 'annual' ? 'Annuelle' : 'Semestre'}</th>
                    <th className="px-6 py-5">{viewMode === 'annual' ? 'Decision Jury' : 'Décision'}</th>
                    <th className="px-6 py-5 text-right">Bulletin</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="p-20 text-center"><div className="flex flex-col items-center gap-4"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div><p className="text-[10px] font-black text-slate-400 uppercase">Chargement des données...</p></div></td></tr>
                  ) : filteredResults.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-medium tracking-tight">Aucun résultat trouvé pour cette sélection.</td></tr>
                  ) : (
                    filteredResults.map((res: any, idx: number) => {
                      const fullName = `${res.student?.lastName || ''} ${res.student?.firstName || ''}`.trim() || 'Étudiant';
                      const initials = (res.student?.lastName?.[0] || '?') + (res.student?.firstName?.[0] || '?');
                      const averageValue = viewMode === 'semester' ? res.semesterAverage : res.annualAverage;

                      return (
                      <tr key={idx} className="border-b border-white/10 hover:bg-white/50 transition-all group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase border border-white shadow-sm group-hover:scale-110 transition-transform">
                                 {initials}
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-800">{fullName}</span>
                                  <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase">{viewMode === 'annual' ? res.mention : `Rang: ${res.rank} / ${stats.count}`}</span>
                               </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <span className={`text-sm font-black ${res.totalCreditsWon >= (viewMode === 'annual' ? 60 : 30) ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {res.totalCreditsWon}
                              </span>
                              <span className="text-[10px] text-slate-300 font-bold">/ {viewMode === 'annual' ? 60 : 30}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-sm font-black px-3 py-2 rounded-xl border ${
                             averageValue >= 12 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                             averageValue >= 10 ? 'text-primary bg-primary/5 border-primary/10' : 
                             'text-red-600 bg-red-50 border-red-100'
                           }`}>
                             {averageValue?.toFixed(2)}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                             (viewMode === 'semester' ? res.semesterAverage : res.annualAverage) >= 10 
                               ? 'bg-emerald-100/50 text-emerald-600 border-emerald-200' 
                               : 'bg-red-100/50 text-red-600 border-red-200'
                           }`}>
                             {viewMode === 'annual' ? res.juryDecision : res.status}
                           </span>
                        </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    const studentId = res.student?.id ?? res.studentId;
                                    if (!studentId) return;
                                    handleDownloadBulletin(studentId, fullName);
                                  }}
                                  disabled={downloadingId === (res.student?.id ?? res.studentId)}
                                  className={`p-3 rounded-xl transition-all shadow-sm ${
                                    downloadingId === (res.student?.id ?? res.studentId)
                                    ? 'bg-slate-100 text-slate-300 animate-pulse' 
                                    : 'bg-white hover:bg-primary hover:text-white text-slate-400 border border-slate-100'
                                  }`}
                                  title={`Télécharger Bulletin ${viewMode === 'annual' ? 'Annuel' : 'PDF'}`}
                                >
                                   <FileText size={16} />
                                </button>
                                <button 
                                  onClick={() => window.location.href = `/dashboard/admin/students?search=${encodeURIComponent(res.student?.lastName || '')}`}
                                  className="p-3 bg-white hover:bg-slate-50 text-slate-400 border border-slate-100 rounded-xl transition-all shadow-sm"
                                  title="Dossier Étudiant"
                                >
                                   <ChevronRight size={16} />
                                </button>
                            </div>
                         </td>
                      </tr>
                      );
                    })
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
  const displayValue = typeof value === 'number' ? value.toFixed(2) : value;
  return (
    <div className="glass-card p-8 border-white/50 bg-white/60 shadow-xl flex flex-col gap-6 group hover:-translate-y-1 transition-all duration-300">
       <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
             {icon}
          </div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{trend}</span>
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
            {displayValue} <span className="text-sm font-bold text-slate-300 tracking-normal">{suffix}</span>
          </h3>
       </div>
    </div>
  );
}
