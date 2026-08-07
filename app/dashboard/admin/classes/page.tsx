'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Users,
  Plus,
  X,
  Check,
  AlertCircle,
  Clock,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { userService, academicService } from '../../../services/api';

export default function ClassesOverview() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; count: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesData, studentsData] = await Promise.all([
        academicService.getClasses(),
        userService.getStudents(),
      ]);
      setClasses(classesData as any[]);
      setStudents(studentsData as any[]);
    } catch {
      showNotification('error', 'Impossible de charger les classes');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const countFor = (className: string) => students.filter((s) => s.class === className).length;

  // Students whose `class` string doesn't match any registered Class — surfaced here
  // instead of silently vanishing, since Student.class is free text (not a foreign key).
  const knownNames = new Set(classes.map((c: any) => c.name));
  const orphanCount = students.filter((s) => !knownNames.has(s.class)).length;

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      setIsSubmitting(true);
      await academicService.createClass({ name: newClassName.trim().toUpperCase() });
      showNotification('success', 'Classe créée avec succès');
      setNewClassName('');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur lors de la création de la classe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await academicService.deleteClass(deleteTarget.id);
      showNotification('success', 'Classe supprimée');
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <GraduationCap className="text-primary w-8 h-8" />
            Classes
          </h1>
          <p className="text-slate-400 text-sm font-medium">Parcourez les effectifs par classe — cliquez sur une carte pour voir ses étudiants.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20 px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all self-start"
        >
          <Plus size={18} />
          Nouvelle Classe
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-slide-up border ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      {loading ? (
        <div className="p-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Chargement des classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="glass-card p-16 text-center border-white/40">
          <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-slate-300" size={32} />
          </div>
          <p className="text-slate-500 font-bold">Aucune classe enregistrée</p>
          <p className="text-slate-400 text-sm mb-4">Créez votre première classe pour commencer à y rattacher des étudiants.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-2xl text-sm font-bold inline-flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> Nouvelle Classe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c: any) => {
            const count = countFor(c.name);
            return (
              <div
                key={c.id}
                className="glass-card group relative border-white/50 p-6 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden"
                onClick={() => router.push(`/dashboard/admin/classes/${encodeURIComponent(c.name)}`)}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -rotate-45 translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <GraduationCap className="text-primary w-6 h-6" />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: c.id, name: c.name, count }); }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Supprimer la classe"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight mt-5">{c.name}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Users size={14} />
                    {count} étudiant{count !== 1 ? 's' : ''}
                  </span>
                  <span className="text-primary flex items-center gap-1 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                    Voir <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {orphanCount > 0 && (
        <div className="glass-card p-5 border-amber-100 bg-amber-50/50 flex items-center gap-3">
          <AlertCircle className="text-amber-500 shrink-0" size={20} />
          <p className="text-sm font-semibold text-amber-700">
            {orphanCount} étudiant{orphanCount !== 1 ? 's ont' : ' a'} une classe qui ne correspond à aucune classe enregistrée ci-dessus
            (probablement saisie manuellement). Vérifiez-les depuis <button onClick={() => router.push('/dashboard/admin/students')} className="underline font-black">Gestion Étudiants</button>.
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-8 border-white/60 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Nouvelle Classe</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de la classe</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: LP ASUR"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold uppercase"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Clock className="animate-spin" size={18} /> : <Plus size={18} />}
                Créer la classe
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-8 border-white/60 shadow-2xl animate-slide-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-50 p-3 rounded-2xl text-red-600 shrink-0">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Supprimer "{deleteTarget.name}" ?</h3>
                <p className="text-slate-400 text-xs font-medium mt-0.5">
                  {deleteTarget.count > 0
                    ? `${deleteTarget.count} étudiant${deleteTarget.count !== 1 ? 's' : ''} garderont cette classe sur leur fiche, mais elle ne sera plus proposée dans les listes.`
                    : "Aucun étudiant n'est actuellement rattaché à cette classe."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Clock className="animate-spin" size={16} /> : <Trash2 size={16} />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
