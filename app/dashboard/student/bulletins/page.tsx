'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { gradesService } from '../../../services/api';
import { FileDown, FileText, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function StudentBulletinsPage() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleDownload = async () => {
    if (!user) return;
    setDownloading(true);
    setMessage(null);

    try {
      // Find the student ID (in this system, user.id might be student.id or we find it)
      // For this implementation, we assume the backend handles the mapping or user has it.
      const blob = await gradesService.downloadBulletin(user.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bulletin_Notes_${user.email.split('@')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Bulletin téléchargé avec succès !' });
    } catch (err: any) {
      setMessage({ type: 'error', text: "Le bulletin n'est pas encore disponible ou une erreur est survenue." });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-primary" />
          Mes Bulletins de Notes
        </h1>
        <p className="text-muted text-sm">Consultez et téléchargez vos documents académiques officiels.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Semester Card Example */}
        <div className="glass-card p-6 flex flex-col gap-6 hover:shadow-lg transition-all border-l-4 border-l-primary">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-lg">Semestre 5</h3>
              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-primary font-bold rounded-full w-fit">LICENCE 3 - GL</span>
            </div>
            <FileDown className="text-slate-300 w-8 h-8" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] text-muted font-bold uppercase">Moyenne</p>
              <p className="text-xl font-bold text-primary">14.60</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] text-muted font-bold uppercase">Crédits</p>
              <p className="text-xl font-bold text-success">30 / 30</p>
            </div>
          </div>

          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary w-full h-11"
          >
            {downloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Télécharger le PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Locked Semester Example */}
        <div className="glass-card p-6 flex flex-col gap-6 opacity-60 cursor-not-allowed bg-slate-50">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-lg">Semestre 6</h3>
              <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-500 font-bold rounded-full w-fit">EN COURS</span>
            </div>
            <FileText className="text-slate-300 w-8 h-8" />
          </div>

          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-xs italic text-center px-8">Le bulletin sera disponible une fois toutes les notes saisies et validées par l'administration.</p>
          </div>

          <button disabled className="btn-primary w-full h-11 bg-slate-300">
            Non disponible
          </button>
        </div>
      </div>

      <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50 flex gap-4 items-start">
        <AlertCircle className="text-amber-500 w-6 h-6 shrink-0 mt-1" />
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>Note importante :</strong> Seuls les bulletins validés par la direction académique apparaissent ici. 
          En cas d'erreur sur vos notes, veuillez contacter le service scolarité muni de vos relevés de CC.
        </p>
      </div>
    </div>
  );
}
