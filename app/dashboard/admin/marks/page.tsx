'use client';

import React, { useState, useEffect } from 'react';
import { Save, User, Book, GraduationCap, AlertCircle, CheckCircle2, Loader2, Info, FileDown, FileUp, Clock, FileSpreadsheet, Lock, ChevronRight, ChevronDown } from 'lucide-react';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import { useAuth } from '../../../context/AuthContext';
import { userService, academicService, gradesService, exportService } from '../../../services/api';

export default function MarksEntryPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isExistingGrade, setIsExistingGrade] = useState(false);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'entry' | 'list'>('entry');
  const [subjectGrades, setSubjectGrades] = useState<any[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const itemsPerPage = 15;

  // Form State
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [ccGrade, setCcGrade] = useState('');
  const [examGrade, setExamGrade] = useState('');
  const [isRattrapageMode, setIsRattrapageMode] = useState(false);
  const [rattrapageGrade, setRattrapageGrade] = useState('');
  const [lastPrefillNoticeKey, setLastPrefillNoticeKey] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const structure = await academicService.getStructure();
        const allSubjects: any[] = [];
        setSemesters(structure);
        if (structure.length > 0) {
          setSelectedSemesterId(structure[0].id);
        }

        structure.forEach((sem: any) => {
          sem.ues.forEach((ue: any) => {
            ue.subjects.forEach((subj: any) => {
              // Filter by teacher assignment only when teacher metadata exists.
              const currentTeacherId = (user as any)?.teacher?.id;
              const isAssigned = currentTeacherId ? subj.teacherId === currentTeacherId : true;
              
              if (isAssigned && !allSubjects.find(s => s.id === subj.id)) {
                allSubjects.push({ ...subj, ueName: ue.name });
              }
            });
          });
        });
        
        // Wait, students aren't directly in semesters in our API structure update, fetch them from userService
        const allStudents = await userService.getStudents();

        setStudents(allStudents);
        setSubjects(allSubjects);
      } catch (err) {
        console.error("Failed to load academic data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const loadExistingGrade = async () => {
      if (!studentId || !subjectId) {
        setIsExistingGrade(false);
        setIsRattrapageMode(false);
        setRattrapageGrade('');
        return;
      }
      const currentKey = `${studentId}:${subjectId}`;
      setMessage(null);

      try {
        const existing = await gradesService.getExistingGrade(studentId, subjectId) as {
          ccGrade?: number | null;
          examGrade?: number | null;
          rattrapageGrade?: number | null;
        } | null;

        const hasExistingData = !!existing && (
          existing.ccGrade !== null && existing.ccGrade !== undefined ||
          existing.examGrade !== null && existing.examGrade !== undefined ||
          existing.rattrapageGrade !== null && existing.rattrapageGrade !== undefined
        );

        if (hasExistingData) {
          setCcGrade(existing.ccGrade !== null && existing.ccGrade !== undefined ? String(existing.ccGrade) : '');
          setExamGrade(existing.examGrade !== null && existing.examGrade !== undefined ? String(existing.examGrade) : '');
          const hasRattrapage = existing.rattrapageGrade !== null && existing.rattrapageGrade !== undefined;
          setIsRattrapageMode(hasRattrapage);
          setRattrapageGrade(hasRattrapage ? String(existing.rattrapageGrade) : '');
          setIsExistingGrade(true);
          if (lastPrefillNoticeKey !== currentKey) {
            setMessage({
              type: 'success',
              text: hasRattrapage
                ? 'Une note de rattrapage existe deja. Les champs ont ete pre-remplis pour modification.'
                : 'Des notes existent deja pour cet etudiant et cette matiere. Les champs ont ete pre-remplis pour modification.',
            });
            setLastPrefillNoticeKey(currentKey);
          }
          return;
        }

        setCcGrade('');
        setExamGrade('');
        setIsExistingGrade(false);
        setIsRattrapageMode(false);
        setRattrapageGrade('');
        setLastPrefillNoticeKey('');
      } catch (error) {
        setIsExistingGrade(false);
        setLastPrefillNoticeKey('');
      }
    };

    loadExistingGrade();
  }, [studentId, subjectId, lastPrefillNoticeKey]);

  useEffect(() => {
    const fetchSubjectGrades = async () => {
      if (!selectedSemesterId) {
        setSubjectGrades([]);
        return;
      }
      try {
        setLoadingGrades(true);
        setCurrentPage(1); // Reset pagination
        const data = await gradesService.getSemesterGrades(selectedSemesterId);
        setSubjectGrades(data);
      } catch (err) {
        console.error("Error fetching subject grades:", err);
      } finally {
        setLoadingGrades(false);
      }
    };
    fetchSubjectGrades();
  }, [selectedSemesterId, activeTab === 'list' && selectedSemesterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        studentId,
        subjectId,
      };

      if (isRattrapageMode) {
        const rattr = rattrapageGrade.trim() === '' ? null : Number(rattrapageGrade);
        payload.rattrapageGrade = rattr;
      } else {
        const cc = ccGrade.trim() === '' ? null : Number(ccGrade);
        const ex = examGrade.trim() === '' ? null : Number(examGrade);
        payload.ccGrade = cc;
        payload.examGrade = ex;
        payload.rattrapageGrade = null;
      }

      await gradesService.enterGrade(payload);
      setMessage({
        type: 'success',
        text: isExistingGrade
          ? 'La note existante a ete mise a jour avec succes.'
          : 'La note a ete enregistree avec succes.',
      });
      setIsExistingGrade(true);
      // Refresh list if needed
      if (selectedSemesterId) {
        const data = await gradesService.getSemesterGrades(selectedSemesterId);
        setSubjectGrades(data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'enregistrement.";
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadGradesTemplate = async () => {
    try {
      const blob = await exportService.downloadTemplate('GRADES');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_notes_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement du canevas Excel.' });
    }
  };

  const handleExportGradesXlsx = async () => {
    if (!selectedSemesterId) {
      setMessage({ type: 'error', text: 'Sélectionnez un semestre pour l’export.' });
      return;
    }
    try {
      const blob = await exportService.downloadGradesXlsx(selectedSemesterId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes_${selectedSemesterId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l’export Excel des notes.' });
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedSemesterId) {
      setMessage({ type: 'error', text: 'Sélectionnez un semestre pour l’import.' });
      e.target.value = '';
      return;
    }

    try {
      setIsImporting(true);
      const result = await exportService.importExcel('grades', file, selectedSemesterId) as { imported?: number; skipped?: number; errors?: string[] };
      setMessage({
        type: 'success',
        text: `${result.imported ?? 0} note(s) importée(s) avec succès. ${result.skipped ?? 0} ligne(s) ignorée(s).`,
      });
      if (result.errors && result.errors.length > 0) {
        console.warn('Erreurs import notes:', result.errors);
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l’import Excel des notes.' });
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Chargement des données académiques...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-primary w-6 h-6" />
           </div>
           <h1 className="text-3xl font-bold tracking-tight">Portail de Saisie des Notes</h1>
        </div>
        <p className="text-slate-500 font-medium ml-1">Enregistrement des résultats CC et Examen pour les classes de LICENCE 3.</p>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <select
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600"
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
          >
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.name} {semester.isLocked ? '(Verrouillé)' : ''}
              </option>
            ))}
          </select>

          {semesters.find(s => s.id === selectedSemesterId)?.isLocked && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-pulse">
              <Lock size={14} />
              <span className="text-[10px] font-black uppercase">Saisie fermée</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleDownloadGradesTemplate}
            className="glass-card p-2 md:px-4 md:py-2 text-sm font-bold text-slate-600 hover:text-primary transition-all border-white/60 rounded-xl flex items-center gap-2"
            title="Canevas notes"
          >
            <FileDown size={16} />
            <span className="hidden md:inline">Canevas notes</span>
          </button>

          <label className={`glass-card p-2 md:px-4 md:py-2 text-sm font-bold transition-all border-white/60 rounded-xl flex items-center gap-2 cursor-pointer ${isImporting ? 'opacity-50 pointer-events-none text-slate-400' : 'text-slate-600 hover:text-primary'}`} title="Importer notes">
            {isImporting ? <Clock size={16} className="animate-spin" /> : <FileUp size={16} />}
            <span className="hidden md:inline">Importer notes</span>
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit self-center md:self-start border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveTab('entry')}
          className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${
            activeTab === 'entry' 
              ? 'bg-white text-primary shadow-md scale-105' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Saisie des notes
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${
            activeTab === 'list' 
              ? 'bg-white text-primary shadow-md scale-105' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Relevé des notes
        </button>
      </div>

      {activeTab === 'entry' ? (
        <div className="glass-card p-10 shadow-2xl relative overflow-hidden bg-white/80">
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -rotate-45 translate-x-1/2 -translate-y-1/2"></div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-8 relative z-10">
            {message && (
              <div className={`p-5 rounded-2xl flex items-center gap-4 border-2 shadow-sm animate-shake ${
                message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                   {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <span className="font-bold text-sm">{message.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="label">Étudiant concerné</label>
                <SearchableSelect 
                  options={students.map(s => ({
                    id: s.id,
                    label: s.name || `${s.lastName} ${s.firstName}`,
                    sublabel: s.studentId || s.class
                  }))}
                  value={studentId}
                  onChange={setStudentId}
                  placeholder="Rechercher un étudiant..."
                  icon={<User className="w-5 h-5" />}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="label">Matière / Module</label>
                <SearchableSelect 
                  options={subjects.map(s => ({
                    id: s.id,
                    label: s.name,
                    sublabel: s.ueName
                  }))}
                  value={subjectId}
                  onChange={setSubjectId}
                  placeholder="Rechercher une matière..."
                  icon={<Book className="w-5 h-5" />}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">Session</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isRattrapageMode;
                    setIsRattrapageMode(next);
                    if (next) {
                      setMessage({
                        type: 'success',
                        text: 'Mode rattrapage actif : la note de rattrapage remplace la moyenne de la matiere.',
                      });
                    } else {
                      setRattrapageGrade('');
                      setMessage({
                        type: 'success',
                        text: 'Mode normal actif : moyenne = CC (40%) + Examen (60%).',
                      });
                    }
                  }}
                  className={`relative inline-flex h-9 w-44 items-center rounded-2xl border transition-all px-1 ${
                    isRattrapageMode ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                  }`}
                  aria-pressed={isRattrapageMode}
                >
                  <span
                    className={`inline-flex h-7 w-20 items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      !isRattrapageMode ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    Normal
                  </span>
                  <span
                    className={`inline-flex h-7 w-20 items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isRattrapageMode ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    Rattrapage
                  </span>
                </button>
              </div>

              {isRattrapageMode && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700">
                  <span className="text-[10px] font-black uppercase tracking-widest">Note issue du rattrapage</span>
                </div>
              )}
            </div>

            <div className="h-px bg-slate-100 w-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="label">Note de Contrôle Continu (/20)</label>
                <input 
                  type="number" 
                  step="0.25" 
                  min="0" 
                  max="20"
                  required={!isRattrapageMode}
                  disabled={isRattrapageMode}
                  placeholder="Ex: 15.50"
                  className={`input-field ${isRattrapageMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                  value={ccGrade}
                  onChange={(e) => setCcGrade(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="label">Note d'Examen Final (/20)</label>
                <input 
                  type="number" 
                  step="0.25" 
                  min="0" 
                  max="20"
                  required={!isRattrapageMode}
                  disabled={isRattrapageMode}
                  placeholder="Ex: 12.75"
                  className={`input-field ${isRattrapageMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                  value={examGrade}
                  onChange={(e) => setExamGrade(e.target.value)}
                />
              </div>
            </div>

            {isRattrapageMode && (
              <div className="flex flex-col gap-2">
                <label className="label">Note de Rattrapage (/20)</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="20"
                  required
                  placeholder="Ex: 10.00"
                  className="input-field border-amber-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30"
                  value={rattrapageGrade}
                  onChange={(e) => setRattrapageGrade(e.target.value)}
                />
                <p className="text-xs text-slate-500 font-medium">
                  En rattrapage, cette note remplace integralement la moyenne de la matiere dans tous les calculs.
                </p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={submitting || (semesters.find(s => s.id === selectedSemesterId)?.isLocked && (user as any)?.role !== 'ADMIN')}
              className={`btn-primary w-full h-16 mt-6 shadow-xl shadow-primary/20 ${(semesters.find(s => s.id === selectedSemesterId)?.isLocked && (user as any)?.role !== 'ADMIN') ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span className="text-base font-bold">
                    {(semesters.find(s => s.id === selectedSemesterId)?.isLocked && (user as any)?.role !== 'ADMIN') 
                      ? 'Session de saisie verrouillée' 
                      : (isExistingGrade ? 'Mettre a jour la note' : 'Valider et enregistrer la note')}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="glass-card overflow-hidden">
             <div className="p-6 border-b border-white/20 bg-white/40 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                   <input 
                     type="text" 
                     placeholder="Filtrer par étudiant ou matière..."
                     className="w-full bg-white/60 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
                <div className="flex items-center gap-3">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                     {semesters.find(s => s.id === selectedSemesterId)?.name || 'Tous les semestres'}
                   </div>
                   
                   <button
                     type="button"
                     onClick={handleExportGradesXlsx}
                     className="glass-card px-4 py-2 text-xs font-bold text-slate-600 hover:text-primary transition-all border-white/60 rounded-xl flex items-center gap-2 bg-white/60"
                     title="Exporter le relevé"
                   >
                     <FileSpreadsheet size={14} />
                     <span>Exporter XLSX</span>
                   </button>
                </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50/50 border-b border-white text-[10px] uppercase tracking-widest text-slate-400 font-black">
                     <th className="px-6 py-5">Étudiant</th>
                     <th className="px-6 py-5">Matière</th>
                     <th className="px-6 py-5">CC</th>
                     <th className="px-6 py-5">Examen</th>
                     <th className="px-6 py-5">Rattrapage</th>
                     <th className="px-6 py-5 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {loadingGrades ? (
                     <tr><td colSpan={6} className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
                   ) : !selectedSemesterId ? (
                     <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-medium italic">Sélectionnez un semestre pour voir les notes.</td></tr>
                   ) : (() => {
                      const filtered = subjectGrades.filter(sg => 
                        sg.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        sg.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sg.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
                      );
                      
                      const grouped = filtered.reduce((acc, curr) => {
                        const sid = curr.student.id;
                        if (!acc[sid]) {
                          acc[sid] = {
                            student: curr.student,
                            items: []
                          };
                        }
                        acc[sid].items.push(curr);
                        return acc;
                      }, {} as Record<string, { student: any, items: any[] }>);

                      const sortedGrouped = Object.values(grouped).sort((a, b) => 
                        a.student.lastName.localeCompare(b.student.lastName)
                      );

                      if (sortedGrouped.length === 0) {
                        return <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-medium italic">Aucune note trouvée.</td></tr>;
                      }

                      return sortedGrouped
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((group, groupIdx) => (
                          <React.Fragment key={groupIdx}>
                            <tr 
                              className={`border-b border-white/10 hover:bg-white/50 transition-all cursor-pointer ${expandedStudentId === group.student.id ? 'bg-primary/5' : ''}`}
                              onClick={() => setExpandedStudentId(expandedStudentId === group.student.id ? null : group.student.id)}
                            >
                              <td className="px-6 py-5" colSpan={5}>
                                <div className="flex items-center gap-4">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${expandedStudentId === group.student.id ? 'bg-primary text-white rotate-90' : 'bg-slate-100 text-slate-400'}`}>
                                    <ChevronRight size={16} />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800">{group.student.lastName} {group.student.firstName}</span>
                                    <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{group.student.studentId} | {group.items.length} notes saisies</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                  {expandedStudentId === group.student.id ? 'Réduire' : 'Détails'}
                                </span>
                              </td>
                            </tr>
                            {expandedStudentId === group.student.id && (
                              <tr>
                                <td colSpan={6} className="px-6 py-0 bg-slate-50/30">
                                  <div className="py-4 flex flex-col gap-2">
                                    <table className="w-full text-left border-collapse bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[9px] uppercase tracking-widest text-slate-400 font-black">
                                          <th className="px-4 py-3">Matière</th>
                                          <th className="px-4 py-3">CC</th>
                                          <th className="px-4 py-3">Examen</th>
                                          <th className="px-4 py-3">Rattrapage</th>
                                          <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {group.items.map((item, itemIdx) => (
                                          <tr key={itemIdx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all">
                                            <td className="px-4 py-3">
                                              <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700">{item.subject.name}</span>
                                                <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase">{item.subject.ueName}</span>
                                              </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-600">{item.grade?.ccGrade ?? '-'}</td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-600">{item.grade?.examGrade ?? '-'}</td>
                                            <td className="px-4 py-3 text-xs font-bold text-amber-600">{item.grade?.rattrapageGrade ?? '-'}</td>
                                            <td className="px-4 py-3 text-right">
                                              <button 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setStudentId(group.student.id);
                                                  setSubjectId(item.subject.id);
                                                  setActiveTab('entry');
                                                }}
                                                className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                                              >
                                                Saisir
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ));
                   })()}
                 </tbody>
               </table>
             </div>

             {selectedSemesterId && (() => {
               const filtered = subjectGrades.filter(sg => 
                 sg.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 sg.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 sg.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
               );
               const groupedCount = new Set(filtered.map(sg => sg.student.id)).size;
               
               if (groupedCount <= itemsPerPage) return null;

               return (
                 <div className="p-6 bg-slate-50/50 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Page {currentPage} sur {Math.ceil(groupedCount / itemsPerPage)}
                    </p>
                    <div className="flex gap-2">
                       <button 
                         disabled={currentPage === 1}
                         onClick={() => setCurrentPage(prev => prev - 1)}
                         className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-50"
                       >
                         Précédent
                       </button>
                       <button 
                         disabled={currentPage >= Math.ceil(groupedCount / itemsPerPage)}
                         onClick={() => setCurrentPage(prev => prev + 1)}
                         className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-50"
                       >
                         Suivant
                       </button>
                    </div>
                 </div>
               );
             })()}
          </div>
        </div>
      )}

      {/* Warning Box */}
      <div className="bg-blue-50/70 p-8 rounded-[2rem] border border-blue-100 flex gap-5 items-start">
        <div className="bg-blue-500 p-2 rounded-xl">
           <Info className="text-white w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="font-bold text-blue-900 text-sm">Règlement Académique INPTIC</h4>
          <p className="text-sm text-blue-800/70 leading-relaxed font-medium">
            La note finale est calculée selon la pondération standard. 
            Si une note existe déjà pour un étudiant dans une matière, elle est automatiquement chargée afin de permettre sa mise à jour.
          </p>
        </div>
      </div>
    </div>
  );
}
