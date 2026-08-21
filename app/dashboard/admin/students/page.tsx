'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  FileDown, 
  FileUp, 
  Search, 
  Trash2, 
  Edit, 
  MoreVertical,
  X,
  Check,
  AlertCircle,
  Clock,
  ExternalLink,
  FileText
} from 'lucide-react';
import { userService, exportService, academicService, gradesService } from '../../../services/api';

export default function StudentsManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingBulletinId, setDownloadingBulletinId] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [semesters, setSemesters] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; students: any[] } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthDate: '',
    birthPlace: '',
    class: '',
    studentId: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchSemesters();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await academicService.getClasses();
      setClasses(data as any[]);
    } catch (err) {
      showNotification('error', 'Impossible de charger les classes');
    }
  };

  const fetchSemesters = async () => {
    try {
      const structure = await academicService.getStructure();
      setSemesters(structure);
      if (structure.length > 0) {
        setSelectedSemesterId(structure[0].id);
      }
    } catch (err) {
      showNotification('error', 'Impossible de charger les semestres');
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await userService.getStudents();
      setStudents(data);
    } catch (err) {
      showNotification('error', 'Impossible de charger les étudiants');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await exportService.downloadTemplate('STUDENTS');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_etudiants_${new Date().toLocaleDateString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showNotification('error', 'Erreur lors du téléchargement du modèle');
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const result = await exportService.importExcel('students', file) as { imported?: number; updated?: number; skipped?: number; errors?: string[] };
      const created = result.imported ?? 0;
      const updated = result.updated ?? 0;
      const errors = result.errors ?? [];
      if (errors.length > 0) console.warn('Erreurs import étudiants:', errors);
      showNotification(
        errors.length > 0 && created + updated === 0 ? 'error' : 'success',
        `${created} étudiant(s) créé(s), ${updated} mis à jour${errors.length > 0 ? `, ${errors.length} ligne(s) en erreur (voir console)` : ''}`,
      );
      fetchStudents();
    } catch (err) {
      showNotification('error', 'Erreur lors de l’importation. Vérifiez le format du fichier.');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingStudent) {
        await userService.updateStudent(editingStudent.id, formData);
        showNotification('success', 'Étudiant mis à jour');
      } else {
        await userService.createStudent(formData);
        showNotification('success', 'Étudiant créé');
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({ firstName: '', lastName: '', email: '', password: '', birthDate: '', birthPlace: '', class: '', studentId: '' });
      fetchStudents();
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur lors de l’opération');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (student: any) => {
    setDeleteTarget({ ids: [student.id], students: [student] });
  };

  const requestBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const targeted = students.filter(s => selectedIds.includes(s.id));
    setDeleteTarget({ ids: selectedIds, students: targeted });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await userService.deleteStudents(deleteTarget.ids);
      showNotification('success', deleteTarget.ids.length > 1
        ? `${deleteTarget.ids.length} étudiants supprimés`
        : 'Étudiant supprimé');
      setSelectedIds(prev => prev.filter(id => !deleteTarget.ids.includes(id)));
      setDeleteTarget(null);
      fetchStudents();
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredStudents.map(s => s.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : visibleIds);
  };

  const handleDownloadBulletin = async (studentId: string, fullName: string) => {
    if (!selectedSemesterId) {
      showNotification('error', 'Sélectionnez un semestre avant le téléchargement');
      return;
    }
    try {
      setDownloadingBulletinId(studentId);
      const blob = await gradesService.downloadBulletin(studentId, selectedSemesterId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin_${fullName.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showNotification('error', 'Erreur lors du téléchargement du bulletin');
    } finally {
      setDownloadingBulletinId(null);
    }
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.user?.email || '',
      password: '',
      birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : '',
      birthPlace: student.birthPlace || '',
      class: student.class,
      studentId: student.studentId || ''
    });
    setShowModal(true);
  };

  const filteredStudents = students.filter(s => 
    s.lastName.toLowerCase().includes(search.toLowerCase()) ||
    s.firstName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="text-primary w-8 h-8" />
            Référentiel Étudiants
          </h1>
          <p className="text-slate-400 text-sm font-medium">Gérez la base de données des étudiants et les inscriptions par lot.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="glass-card px-4 py-2.5 text-sm font-bold text-slate-600 border-white/60 rounded-2xl"
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
          >
            {semesters.map((sem) => (
              <option key={sem.id} value={sem.id}>
                {sem.name}
              </option>
            ))}
          </select>
          <button 
            onClick={handleDownloadTemplate}
            className="glass-card p-2.5 md:px-4 md:py-2.5 text-sm font-bold text-slate-600 hover:text-primary transition-all flex items-center gap-2 border-white/60"
            title="Canevas Excel"
          >
            <FileDown size={18} />
            <span className="hidden md:inline">Canevas Excel</span>
          </button>
          
          <label className={`
            glass-card p-2.5 md:px-4 md:py-2.5 text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border-white/60
            ${isImporting ? 'opacity-50 pointer-events-none' : 'hover:text-primary'}
          `} title="Importer Excel">
            {isImporting ? <Clock className="animate-spin" size={18} /> : <FileUp size={18} />}
            <span className="hidden md:inline">Importer Excel</span>
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
          </label>

          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20 p-2.5 md:px-6 md:py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all"
            title="Nouvel Étudiant"
          >
            <UserPlus size={18} />
            <span className="hidden md:inline">Nouvel Étudiant</span>
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

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-6 border-white/50 bg-gradient-to-br from-blue-50/50 to-white/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Étudiants</p>
            <h3 className="text-3xl font-black text-slate-800">{students.length}</h3>
         </div>
         <div className="glass-card p-6 border-white/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Inscrits Récemment</p>
            <h3 className="text-3xl font-black text-slate-800">
              {students.filter(s => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return new Date(s.createdAt) > sevenDaysAgo;
              }).length}
              <span className="text-sm font-medium text-success text-emerald-500 ml-2">7j</span>
            </h3>
         </div>
         <div className="glass-card p-6 border-white/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Classe Majoritaire</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight truncate">
              {(() => {
                const classes = students.map(s => s.class);
                if (classes.length === 0) return 'N/A';
                const counts = classes.reduce((acc: any, c) => {
                  acc[c] = (acc[c] || 0) + 1;
                  return acc;
                }, {});
                return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0][0];
              })()}
            </h3>
         </div>
      </div>

      {/* Table Section */}
      <div className="glass-card flex flex-col border-white/40 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher par nom, prénom ou matricule..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/60 border-2 border-white/80 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/30 focus:bg-white transition-all font-medium"
              />
           </div>
           <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <button
                  onClick={requestBulkDelete}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  <Trash2 size={14} /> Supprimer ({selectedIds.length})
                </button>
              )}
              <span className="text-xs font-bold text-slate-400 px-3 truncate">
                Affichage de {filteredStudents.length} sur {students.length}
              </span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/20 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                <th className="px-6 py-5 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                    checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.includes(s.id))}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-5">Matricule</th>
                <th className="px-6 py-5">Nom & Prénom</th>
                <th className="px-6 py-5">Classe</th>
                <th className="px-6 py-5">Email</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Chargement sécurisé...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Search className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-500 font-bold">Aucun étudiant trouvé</p>
                    <p className="text-slate-400 text-sm">Essayez d'ajuster vos filtres ou importez un fichier Excel.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className={`group border-b border-white/10 hover:bg-white/50 transition-all ${selectedIds.includes(student.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                        checked={selectedIds.includes(student.id)}
                        onChange={() => toggleSelectOne(student.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-600 border border-white">
                        {student.studentId || 'NON-DÉFINI'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{student.lastName} {student.firstName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Né(e) le {new Date(student.birthDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-600">{student.class}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400 font-medium">{student.user?.email}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEditModal(student)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-all border border-transparent hover:border-blue-100">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => requestDelete(student)} className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100">
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadBulletin(student.id, `${student.lastName} ${student.firstName}`)}
                          disabled={downloadingBulletinId === student.id}
                          className={`p-2 rounded-xl transition-all border border-transparent ${
                            downloadingBulletinId === student.id
                              ? 'bg-slate-100 text-slate-300'
                              : 'hover:bg-primary/10 text-slate-400 hover:text-primary hover:border-primary/10'
                          }`}
                          title="Télécharger bulletin"
                        >
                          <FileText size={16} />
                        </button>
                        <button className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-all border border-transparent hover:border-slate-200">
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-slate-50/50 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base de données INPTIC v1.0</p>
           <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
           </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
           <div className="glass-card w-full max-w-xl p-8 border-white/60 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">
                   {editingStudent ? 'Modifier Étudiant' : 'Nouvel Étudiant'}
                 </h3>
                 <button onClick={() => { setShowModal(false); setEditingStudent(null); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleAddOrEdit} className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                       <input 
                         type="text" required
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold"
                         value={formData.lastName}
                         onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                       <input 
                         type="text" required
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold"
                         value={formData.firstName}
                         onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date de naissance</label>
                       <input 
                         type="date" required
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold"
                         value={formData.birthDate}
                         onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classe / Niveau</label>
                       <select
                         required
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold"
                         value={formData.class}
                         onChange={(e) => setFormData({...formData, class: e.target.value})}
                       >
                         <option value="" disabled>Sélectionner une classe...</option>
                         {formData.class && !classes.some((c: any) => c.name === formData.class) && (
                           <option value={formData.class}>{formData.class} (existante)</option>
                         )}
                         {classes.map((c: any) => (
                           <option key={c.id} value={c.name}>{c.name}</option>
                         ))}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lieu de naissance</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Libreville"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold"
                      value={formData.birthPlace}
                      onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    />
                 </div>

                 {!editingStudent && (
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Académique</label>
                         <input 
                           type="email" required
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold"
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
                         <input 
                           type="password" required={!editingStudent}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold"
                           value={formData.password}
                           onChange={(e) => setFormData({...formData, password: e.target.value})}
                         />
                      </div>
                   </div>
                 )}

                 <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {editingStudent ? 'Enregistrer les modifications' : 'Confirmer l\'inscription'}
                    </button>
                 </div>
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
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">
                      {deleteTarget.ids.length > 1 ? `Supprimer ${deleteTarget.ids.length} étudiants ?` : 'Supprimer cet étudiant ?'}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Cette action est irréversible : notes et absences associées seront aussi supprimées.</p>
                 </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-h-48 overflow-y-auto flex flex-col gap-2 mb-6">
                 {deleteTarget.students.map((s: any) => (
                   <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700">{s.lastName} {s.firstName}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{s.studentId || 'NON-DÉFINI'}</span>
                   </div>
                 ))}
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
