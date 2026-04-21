'use client';

import React, { useState, useEffect } from 'react';
import { Save, User, Book, GraduationCap, AlertCircle, CheckCircle2, Loader2, Info, Search } from 'lucide-react';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import { useAuth } from '../../../context/AuthContext';
import { userService, academicService, gradesService } from '../../../services/api';

export default function MarksEntryPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [ccGrade, setCcGrade] = useState('');
  const [examGrade, setExamGrade] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const structure = await academicService.getStructure();
        const allSubjects: any[] = [];

        structure.forEach((sem: any) => {
          sem.ues.forEach((ue: any) => {
            ue.subjects.forEach((subj: any) => {
              // Filter: If user is TEACHER, only show subjects they are assigned to
              const isAssigned = user?.role === 'TEACHER' ? subj.teacherId === user.teacher?.id : true;
              
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      await gradesService.enterGrade({
        studentId,
        subjectId,
        ccGrade: parseFloat(ccGrade),
        examGrade: parseFloat(examGrade)
      });
      setMessage({ type: 'success', text: 'La note a été transmise avec succès au serveur.' });
      setCcGrade('');
      setExamGrade('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Erreur lors de l'enregistrement." });
    } finally {
      setSubmitting(false);
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
      </div>

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

          <div className="h-px bg-slate-100 w-full"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="label">Note de Contrôle Continu (/20)</label>
              <input 
                type="number" 
                step="0.25" 
                min="0" 
                max="20"
                required
                placeholder="Ex: 15.50"
                className="input-field"
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
                required
                placeholder="Ex: 12.75"
                className="input-field"
                value={examGrade}
                onChange={(e) => setExamGrade(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="btn-primary w-full h-16 mt-6 shadow-xl shadow-primary/20"
          >
            {submitting ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span className="text-base font-bold">Valider et enregistrer la note</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Warning Box */}
      <div className="bg-blue-50/70 p-8 rounded-[2rem] border border-blue-100 flex gap-5 items-start">
        <div className="bg-blue-500 p-2 rounded-xl">
           <Info className="text-white w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="font-bold text-blue-900 text-sm">Règlement Académique INPTIC</h4>
          <p className="text-sm text-blue-800/70 leading-relaxed font-medium">
            La note finale est calculée selon la pondération standard. 
            Toute note saisie est définitive. En cas d'erreur de frappe, 
            veuillez contacter le responsable de la scolarité pour une correction manuelle sur la base de données.
          </p>
        </div>
      </div>
    </div>
  );
}
