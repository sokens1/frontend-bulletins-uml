'use client';

import React, { useState, useEffect } from 'react';
import { academicService, gradesService } from '../../../services/api';
import { Save, User, Book, GraduationCap, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function MarksEntryPage() {
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
        // Flattening structure to get all students and subjects for this simple demo
        // In a real app, we would filter by Semester/UE
        const allSubjects: any[] = [];
        const allStudents: any[] = [];

        structure.semesters.forEach((sem: any) => {
          sem.ues.forEach((ue: any) => {
            ue.subjects.forEach((subj: any) => {
              if (!allSubjects.find(s => s.id === subj.id)) allSubjects.push(subj);
            });
          });
          sem.students.forEach((std: any) => {
            if (!allStudents.find(s => s.id === std.id)) allStudents.push(std);
          });
        });

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
      setMessage({ type: 'success', text: 'Note enregistrée avec succès !' });
      setCcGrade('');
      setExamGrade('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Erreur lors de l'enregistrement" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="text-primary" />
          Saisie des Notes
        </h1>
        <p className="text-muted text-sm">Enregistrez les résultats académiques pour chaque étudiant.</p>
      </div>

      <div className="glass-card p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 border ${
              message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium text-sm">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="input-group">
              <label className="label">Étudiant</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  required
                  className="input-field pl-10 appearance-none bg-white"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                >
                  <option value="">Sélectionner un étudiant</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name || s.email}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="label">Matière</label>
              <div className="relative">
                <Book className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  required
                  className="input-field pl-10 appearance-none bg-white"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                >
                  <option value="">Sélectionner une matière</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="input-group">
              <label className="label">Note Contrôle Continu (CC)</label>
              <input 
                type="number" 
                step="0.25" 
                min="0" 
                max="20"
                required
                placeholder="Ex: 14.5"
                className="input-field"
                value={ccGrade}
                onChange={(e) => setCcGrade(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="label">Note Examen</label>
              <input 
                type="number" 
                step="0.25" 
                min="0" 
                max="20"
                required
                placeholder="Ex: 12.0"
                className="input-field"
                value={examGrade}
                onChange={(e) => setExamGrade(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="btn-primary w-full h-12 mt-4"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Enregistrer la note</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info helper */}
      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 flex gap-4 items-start">
        <AlertCircle className="text-blue-500 w-6 h-6 shrink-0 mt-1" />
        <p className="text-sm text-slate-600 leading-relaxed">
          Les notes sont automatiquement pondérées selon le règlement en vigueur (CC 40% / Examen 60%). 
          La validation de l'UE sera mise à jour instantanément après l'enregistrement.
        </p>
      </div>
    </div>
  );
}
