'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { gradesService, academicService } from '../../../services/api';
import { FileDown, FileText, Download, Loader2, AlertCircle, CheckCircle, GraduationCap, Lock } from 'lucide-react';

export default function StudentBulletinsPage() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [semestersData, setSemestersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const structure = await academicService.getStructure();
      
      const detailedSems = await Promise.all(structure.map(async (sem: any) => {
        try {
          const stats = await gradesService.getPromotionStats(sem.id);
          const studentResult = stats.studentResults?.find((r: any) => r.student.userId === user?.id);
          return {
            ...sem,
            stats: studentResult || null,
            isLocked: !studentResult // If no result found, consider it locked/pending
          };
        } catch (e) {
          return { ...sem, isLocked: true };
        }
      }));

      setSemestersData(detailedSems);
    } catch (err) {
      console.error("Error loading bulletins data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!user) return;
    setDownloading(true);
    setMessage(null);

    try {
      const blob = await gradesService.downloadBulletin(user.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bulletin_INPTIC_${user.email.split('@')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Document généré et téléchargé avec succès.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: "Le bulletin n'est pas encore disponible. Contactez l'administration." });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold uppercase text-[10px] tracking-widest text-primary">Préparation de vos documents...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileText className="text-primary w-6 h-6" />
           </div>
           <h1 className="text-3xl font-bold tracking-tight text-slate-800">Mes Documents Académiques</h1>
        </div>
        <p className="text-slate-500 font-medium ml-1">Retrouvez ici vos bulletins de notes officiels certifiés par l'INPTIC.</p>
      </div>

      {message && (
        <div className={`p-5 rounded-3xl flex items-center gap-4 border-2 shadow-xl animate-slide-up ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
             {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <span className="font-bold text-sm tracking-tight">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {semestersData.map((sem, index) => (
          <div key={sem.id} className={`glass-card p-10 flex flex-col gap-10 transition-all duration-500 border-l-8 ${
            sem.isLocked 
            ? 'opacity-60 grayscale bg-slate-100 cursor-not-allowed border-l-slate-300' 
            : 'group hover:-translate-y-2 border-l-primary shadow-2xl bg-white/90'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full w-fit ${
                  sem.isLocked ? 'bg-slate-200 text-slate-400' : 'bg-primary/5 text-primary uppercase'
                }`}>
                  {sem.isLocked ? 'À VENIR' : `LICENCE - ${sem.year}`}
                </span>
                <h3 className={`font-black text-3xl ${sem.isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                  {sem.name}
                </h3>
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                sem.isLocked ? 'bg-slate-50' : 'bg-slate-50 group-hover:bg-primary/10'
              }`}>
                 {sem.isLocked ? <Lock className="text-slate-300 w-8 h-8" /> : <GraduationCap className="text-slate-300 group-hover:text-primary w-8 h-8 transition-colors" />}
              </div>
            </div>

            {!sem.isLocked ? (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-1 shadow-inner">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Moyenne</p>
                    <p className="text-3xl font-black text-primary">{sem.stats?.semesterAverage?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-1 shadow-inner">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Crédits</p>
                    <p className="text-3xl font-black text-success">{sem.stats?.totalCreditsWon || 0} / 30</p>
                  </div>
                </div>

                <button 
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn-primary w-full h-16 shadow-xl shadow-primary/20 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  {downloading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span className="font-bold">Télécharger le Bulletin (PDF)</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-[2rem]">
                <p className="text-sm font-bold text-slate-400 italic text-center px-10">Bulletin en cours de délibération par le jury académique.</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info helper */}
      <div className="bg-slate-800 p-10 rounded-[3rem] text-white flex flex-col md:flex-row gap-8 items-center shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="z-10 w-20 h-20 bg-white/10 rounded-full flex items-center justify-center shrink-0">
          <AlertCircle className="text-secondary w-10 h-10" />
        </div>
        <div className="z-10 flex flex-col gap-2 text-center md:text-left">
          <p className="text-lg font-bold">Une erreur sur vos notes ?</p>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Les bulletins téléchargés ici font foi de documents officiels. Pour toute erreur de saisie ou réclamation de CC, veuillez vous adresser au service de la Scolarité muni de vos copies originales avant la fin des délibérations.
          </p>
        </div>
      </div>
    </div>
  );
}
