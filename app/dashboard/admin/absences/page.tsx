'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  Save, 
  AlertCircle, 
  Check,
  User,
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  X,
  ChevronDown,
  Lock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { attendanceService, academicService, userService } from '../../../services/api';
import SearchableSelect from '../../../components/ui/SearchableSelect';

export default function AbsenceManagement() {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [students, setStudents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    hoursAbsent: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attData, structure, studentsData] = await Promise.all([
        attendanceService.getAttendances(),
        academicService.getStructure(),
        userService.getStudents()
      ]);
      setAttendances(attData);
      setStudents(studentsData);
      
      // Extract subjects from structure
      const allSubjects: any[] = [];
      structure.forEach((sem: any) => {
        sem.ues.forEach((ue: any) => {
          ue.subjects.forEach((s: any) => allSubjects.push({ ...s, ueName: ue.name }));
        });
      });
      setSubjects(allSubjects);
    } catch (err) {
      showNotification('error', 'Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.subjectId) return;
    try {
      setIsSubmitting(true);
      await attendanceService.createAttendance(formData);
      showNotification('success', 'Absence enregistrée');
      setShowAddModal(false);
      setFormData({ studentId: '', subjectId: '', hoursAbsent: 0 });
      fetchData();
    } catch (err) {
      showNotification('error', 'Erreur lors de l’enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer cet enregistrement ?')) return;
    try {
      await attendanceService.deleteAttendance(id);
      showNotification('success', 'Enregistrement supprimé');
      fetchData();
    } catch (err) {
      showNotification('error', 'Erreur lors de la suppression');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await attendanceService.updateAttendance(id, editValue);
      showNotification('success', 'Absence mise à jour');
      setEditingId(null);
      fetchData();
    } catch (err) {
      showNotification('error', 'Erreur lors de la mise à jour');
    }
  };

  const filteredAttendances = attendances.filter(a => {
    const matchesSubject = filterSubject ? a.subjectId === filterSubject : true;
    const matchesSearch = searchStudent 
      ? (a.student.lastName + ' ' + a.student.firstName).toLowerCase().includes(searchStudent.toLowerCase())
      : true;
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Clock className="text-primary w-8 h-8" />
            Suivi des Absences
          </h1>
          <p className="text-slate-400 text-sm font-medium">Contrôlez le volume horaire d'absence pour l'application des pénalités.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="glass-card hidden sm:flex px-4 py-2 flex items-center gap-2 border-white/60">
              <span className="text-[10px] font-black uppercase text-slate-400">Total Saisi:</span>
              <span className="text-sm font-bold text-primary">{attendances.length} enregistrements</span>
           </div>
           <button 
             onClick={() => setShowAddModal(true)}
             className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
           >
              <Plus size={18} />
              Saisir une Absence
           </button>
        </div>
      </div>

      {/* Notification Area */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-slide-up border ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="glass-card p-6 border-white/60 shadow-xl flex flex-col md:flex-row gap-4 items-end">
         <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
               <User size={10} /> Étudiant
            </label>
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Nom ou Prénom..."
                 className="w-full bg-slate-50/50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                 value={searchStudent}
                 onChange={(e) => setSearchStudent(e.target.value)}
               />
            </div>
         </div>

         <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
               <BookOpen size={10} /> Matière
            </label>
            <div className="relative">
               <select 
                 className="w-full bg-slate-50/50 border border-slate-100 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none font-medium"
                 value={filterSubject}
                 onChange={(e) => setFilterSubject(e.target.value)}
               >
                 <option value="">Toutes les matières</option>
                 {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
         </div>

         <button 
           onClick={() => {setSearchStudent(''); setFilterSubject('');}}
           className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-all"
         >
           Réinitialiser
         </button>
      </div>

      {/* Table Section */}
      <div className="glass-card overflow-hidden border-white/40 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-white text-[10px] uppercase tracking-widest text-slate-400 font-black">
                <th className="px-6 py-5">Étudiant</th>
                <th className="px-6 py-5">Matière</th>
                <th className="px-6 py-5 text-center">Volume Horaires (h)</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-slate-400 font-medium">
                    Aucun enregistrement d'absence trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredAttendances.map((att) => (
                  <tr key={att.id} className="border-b border-white/10 hover:bg-white/40 transition-all">
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{att.student.lastName} {att.student.firstName}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{att.student.class}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-semibold text-slate-600">{att.subject.name}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {editingId === att.id ? (
                         <input 
                           type="number"
                           className="w-20 bg-white border-2 border-primary/20 rounded-lg px-2 py-1 text-center font-bold text-primary focus:outline-none focus:border-primary shadow-inner"
                           value={editValue}
                           onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                           autoFocus
                         />
                       ) : (
                         <div className="flex flex-col items-center gap-1">
                            <span className={`font-black text-sm ${att.hoursAbsent > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                              {att.hoursAbsent} h
                            </span>
                            {att.subject?.ue?.semester?.isLocked && (
                              <span className="flex items-center gap-1 text-[8px] font-black uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                <Lock size={8} /> Verrouillé
                              </span>
                            )}
                         </div>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {editingId === att.id ? (
                         <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => handleUpdate(att.id)}
                             className="p-2 bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
                           >
                             <Save size={16} />
                           </button>
                           <button 
                             onClick={() => setEditingId(null)}
                             className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-all"
                           >
                             <X size={16} />
                           </button>
                         </div>
                       ) : (
                          <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => handleDelete(att.id)}
                               disabled={att.subject?.ue?.semester?.isLocked && (user as any)?.role !== 'ADMIN'}
                               className={`p-2 rounded-lg transition-all ${
                                 att.subject?.ue?.semester?.isLocked && (user as any)?.role !== 'ADMIN'
                                   ? 'text-slate-200 cursor-not-allowed'
                                   : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                               }`}
                             >
                               <Trash2 size={16} />
                             </button>
                             <button 
                               onClick={() => { setEditingId(att.id); setEditValue(att.hoursAbsent); }}
                               disabled={att.subject?.ue?.semester?.isLocked && (user as any)?.role !== 'ADMIN'}
                               className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all border ${
                                 att.subject?.ue?.semester?.isLocked && (user as any)?.role !== 'ADMIN'
                                   ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                   : 'text-primary hover:bg-primary/10 border-primary/20'
                               }`}
                             >
                               Modifier
                             </button>
                          </div>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
           <div className="glass-card w-full max-w-md p-8 border-white/60 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Enregistrer une Absence</h3>
                 <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Étudiant</label>
                    <SearchableSelect 
                      options={students.map(s => ({
                        id: s.id,
                        label: `${s.lastName} ${s.firstName}`,
                        sublabel: s.studentId || s.class
                      }))}
                      value={formData.studentId}
                      onChange={(id) => setFormData({...formData, studentId: id})}
                      placeholder="Sélectionner l'étudiant..."
                      icon={<User size={18} />}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Matière</label>
                    <SearchableSelect 
                      options={subjects.map(s => ({
                        id: s.id,
                        label: s.name,
                        sublabel: s.ueName
                      }))}
                      value={formData.subjectId}
                      onChange={(id) => setFormData({...formData, subjectId: id})}
                      placeholder="Sélectionner la matière..."
                      icon={<BookOpen size={18} />}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Heures d'absence</label>
                    <input 
                      type="number"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary transition-all font-bold"
                      value={formData.hoursAbsent}
                      onChange={(e) => setFormData({...formData, hoursAbsent: parseInt(e.target.value) || 0})}
                    />
                 </div>

                 <button 
                   type="submit"
                   disabled={isSubmitting || (subjects.find(s => s.id === formData.subjectId)?.ue?.semester?.isLocked && (user as any)?.role !== 'ADMIN')}
                   className="w-full bg-primary text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                 >
                   {(subjects.find(s => s.id === formData.subjectId)?.ue?.semester?.isLocked && (user as any)?.role !== 'ADMIN') 
                     ? 'Semestre Verrouillé' 
                     : 'Enregistrer l\'absence'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

