'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Save, 
  Trash2, 
  Edit3, 
  Layers,
  GraduationCap,
  Calendar,
  User,
  Percent,
  Check,
  X,
  AlertCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { academicService, userService, settingsService } from '../../../services/api';

export default function AcademicManagement() {
  const [structure, setStructure] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSems, setExpandedSems] = useState<string[]>([]);
  const [expandedUEs, setExpandedUEs] = useState<string[]>([]);
  
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectData, setEditSubjectData] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [rulesSettings, setRulesSettings] = useState({
    absencePenaltyPerHour: 0.01,
    soutenanceUeCode: 'UE6-2',
    enableSoutenanceRetake: true,
  });

  // Creation states
  const [showUEModal, setShowUEModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [targetSemesterId, setTargetSemesterId] = useState<string | null>(null);
  const [targetUEId, setTargetUEId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newUEData, setNewUEData] = useState({
    name: '',
    code: '',
    credits: 6,
    semesterId: ''
  });

  const [newSubjectData, setNewSubjectData] = useState({
    name: '',
    coefficient: 1,
    credits: 3,
    ccWeight: 0.4,
    examWeight: 0.6,
    teacherId: '',
    ueId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [data, teachersData, rulesData] = await Promise.all([
        academicService.getStructure(),
        userService.getTeachers(),
        settingsService.getAcademicRules()
      ]);
      setStructure(data);
      setTeachers(teachersData);
      setRulesSettings(rulesData as {
        absencePenaltyPerHour: number;
        soutenanceUeCode: string;
        enableSoutenanceRetake: boolean;
      });
      
      // Auto-expand active semester
      if (data.length > 0) setExpandedSems([data[0].id]);
    } catch (err) {
      showNotification('error', 'Impossible de charger la structure');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const toggleSem = (id: string) => {
    setExpandedSems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleUE = (id: string) => {
    setExpandedUEs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleEditSubject = (subject: any) => {
    setEditingSubjectId(subject.id);
    setEditSubjectData({ ...subject });
  };

  const handleSaveSubject = async () => {
    try {
      await academicService.updateSubject(editingSubjectId!, {
        coefficient: parseFloat(editSubjectData.coefficient),
        ccWeight: parseFloat(editSubjectData.ccWeight),
        examWeight: parseFloat(editSubjectData.examWeight),
        teacherId: editSubjectData.teacherId === 'none' ? null : editSubjectData.teacherId,
        credits: parseInt(editSubjectData.credits)
      });
      showNotification('success', 'Matière mise à jour');
      setEditingSubjectId(null);
      fetchData();
    } catch (err) {
      showNotification('error', 'Erreur lors de la mise à jour');
    }
  };

  const handleCreateUE = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await academicService.createUE({ ...newUEData, semesterId: targetSemesterId });
      showNotification('success', 'UE créée avec succès');
      setShowUEModal(false);
      fetchData();
    } catch (err) {
      showNotification('error', 'Erreur lors de la création de l\'UE');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await academicService.createSubject({ 
        ...newSubjectData, 
        ueId: targetUEId,
        teacherId: newSubjectData.teacherId || null 
      });
      showNotification('success', 'Matière créée avec succès');
      setShowSubjectModal(false);
      fetchData();
    } catch (err) {
      showNotification('error', 'Erreur lors de la création de la matière');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Supprimer cette matière ?')) return;
    try {
      await academicService.deleteSubject(id);
      showNotification('success', 'Matière supprimée');
      fetchData();
    } catch (err) {
      showNotification('error', 'Erreur lors de la suppression');
    }
  };

  const handleDeleteUE = async (id: string) => {
    if (!confirm('Supprimer cette UE et toutes ses matières ?')) return;
    try {
      await academicService.deleteUE(id);
      showNotification('success', 'UE supprimée');
      fetchData();
    } catch (err) {
      showNotification('error', 'Erreur lors de la suppression');
    }
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const updated = await settingsService.updateAcademicRules({
        absencePenaltyPerHour: Number(rulesSettings.absencePenaltyPerHour),
        soutenanceUeCode: rulesSettings.soutenanceUeCode,
        enableSoutenanceRetake: rulesSettings.enableSoutenanceRetake,
      });
      setRulesSettings(updated as {
        absencePenaltyPerHour: number;
        soutenanceUeCode: string;
        enableSoutenanceRetake: boolean;
      });
      showNotification('success', 'Paramètres des règles de gestion mis à jour');
    } catch (err) {
      showNotification('error', 'Erreur lors de la mise à jour des paramètres');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLock = async (e: React.MouseEvent, semesterId: string) => {
    e.stopPropagation();
    if (!confirm('Voulez-vous changer l\'état de verrouillage de ce semestre ? Cela affectera les droits de saisie.')) return;
    try {
      await academicService.toggleSemesterLock(semesterId);
      showNotification('success', 'État de verrouillage mis à jour');
      fetchData();
    } catch (err) {
      showNotification('error', 'Erreur lors du verrouillage');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <BookOpen className="text-primary w-8 h-8" />
            Configuration Académique
          </h1>
          <p className="text-slate-400 text-sm font-medium">Structurez vos UE, gérez les pondérations et assignez les enseignants.</p>
        </div>

        <div className="flex items-center gap-3">
           <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
              <Plus size={18} />
              Ajouter un Semestre
           </button>
        </div>
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
        <div className="flex justify-center p-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {structure.map(semester => (
            <div key={semester.id} className="glass-card overflow-hidden border-white/50 shadow-xl">
               {/* Semester Header */}
               <div 
                 onClick={() => toggleSem(semester.id)}
                 className={`p-6 flex items-center justify-between cursor-pointer transition-all ${expandedSems.includes(semester.id) ? 'bg-slate-50/80 border-b border-slate-100' : 'hover:bg-slate-50/50'}`}
               >
                 <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-primary">
                       <Calendar size={22} />
                    </div>
                    <div className="flex flex-col">
                       <h3 className="font-black text-slate-800 text-lg tracking-tight">{semester.name}</h3>
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Année Universitaire {semester.year}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 mr-2">
                       <button 
                         onClick={(e) => handleToggleLock(e, semester.id)}
                         className={`p-2 rounded-xl border transition-all flex items-center gap-2 ${
                           semester.isLocked 
                             ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100' 
                             : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                         }`}
                         title={semester.isLocked ? "Déverrouiller le semestre" : "Verrouiller le semestre"}
                       >
                          {semester.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                          <span className="text-[10px] font-black uppercase hidden sm:block">
                            {semester.isLocked ? 'Verrouillé' : 'Ouvert'}
                          </span>
                       </button>
                    </div>
                    <div className="hidden md:flex gap-4">
                       <StatBadge label="UEs" value={semester.ues.length} />
                       <StatBadge label="Crédits Total" value={semester.ues.reduce((acc: number, ue: any) => acc + ue.credits, 0)} />
                    </div>
                    {expandedSems.includes(semester.id) ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                 </div>
               </div>

               {/* UEs List */}
               {expandedSems.includes(semester.id) && (
                 <div className="p-6 bg-white/40 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unités d'Enseignement (UE)</p>
                       <button 
                         onClick={() => { setTargetSemesterId(semester.id); setShowUEModal(true); }}
                         disabled={semester.isLocked}
                         className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all ${
                           semester.isLocked 
                             ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                             : 'text-primary bg-primary/5 hover:bg-primary/10'
                         }`}
                        >
                          <Plus size={12} /> Ajouter UE
                       </button>
                    </div>

                    {semester.ues.map((ue: any) => (
                      <div key={ue.id} className="flex flex-col border border-slate-100 rounded-2xl bg-white/80 overflow-hidden shadow-sm transition-all hover:shadow-md">
                         {/* UE Header */}
                         <div 
                           onClick={() => toggleUE(ue.id)}
                           className={`p-5 flex items-center justify-between cursor-pointer ${expandedUEs.includes(ue.id) ? 'bg-slate-50/50 border-b border-slate-50' : ''}`}
                         >
                            <div className="flex items-center gap-3">
                               <Layers className="text-slate-400" size={18} />
                               <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{ue.code || 'UE'} :</span>
                                  <span className="font-medium text-slate-600">{ue.name}</span>
                               </div>
                               <span className="ml-3 bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-blue-100">
                                 {ue.credits} ECTS
                               </span>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={() => handleDeleteUE(ue.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                  <Trash2 size={14} />
                               </button>
                               {expandedUEs.includes(ue.id) ? <ChevronDown size={16} className="text-slate-300" /> : <ChevronRight size={16} className="text-slate-300" />}
                            </div>
                         </div>

                         {/* Subjects Table */}
                         {expandedUEs.includes(ue.id) && (
                           <div className="p-4 bg-white">
                              <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                                 <thead>
                                   <tr className="text-[9px] font-black uppercase text-slate-300 tracking-widest px-4">
                                      <th className="pb-3 pl-4">Matière</th>
                                      <th className="pb-3">Coef.</th>
                                      <th className="pb-3">Crédits</th>
                                      <th className="pb-3">Pondération (CC / Exam)</th>
                                      <th className="pb-3">Enseignant</th>
                                      <th className="pb-3 text-right pr-4">Outils</th>
                                   </tr>
                                 </thead>
                                 <tbody>
                                   {ue.subjects.map((subj: any) => (
                                     <tr key={subj.id} className={`group ${editingSubjectId === subj.id ? 'bg-primary/5' : 'hover:bg-slate-50' } rounded-xl transition-all`}>
                                        <td className="py-3 pl-4 rounded-l-xl">
                                           <span className="font-bold text-slate-700">{subj.name}</span>
                                        </td>
                                        <td className="py-3">
                                           {editingSubjectId === subj.id ? (
                                             <input 
                                               type="number" 
                                               className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold"
                                               value={editSubjectData.coefficient}
                                               onChange={(e) => setEditSubjectData({...editSubjectData, coefficient: e.target.value})}
                                             />
                                           ) : (
                                             <span className="text-slate-500 font-medium">{subj.coefficient}</span>
                                           )}
                                        </td>
                                        <td className="py-3">
                                           {editingSubjectId === subj.id ? (
                                             <input 
                                               type="number" 
                                               className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold"
                                               value={editSubjectData.credits}
                                               onChange={(e) => setEditSubjectData({...editSubjectData, credits: e.target.value})}
                                             />
                                           ) : (
                                             <span className="text-slate-500 font-medium">{subj.credits}</span>
                                           )}
                                        </td>
                                        <td className="py-3">
                                           {editingSubjectId === subj.id ? (
                                             <div className="flex items-center gap-2">
                                                <input 
                                                  type="number" 
                                                  className="w-14 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-black"
                                                  value={editSubjectData.ccWeight}
                                                  onChange={(e) => {
                                                    const cc = parseFloat(e.target.value) || 0;
                                                    setEditSubjectData({...editSubjectData, ccWeight: cc, examWeight: (1-cc).toFixed(1)});
                                                  }}
                                                />
                                                <span className="text-slate-300">/</span>
                                                <input 
                                                  type="number" 
                                                  className="w-14 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-black"
                                                  value={editSubjectData.examWeight}
                                                  onChange={(e) => setEditSubjectData({...editSubjectData, examWeight: e.target.value})}
                                                  readOnly
                                                />
                                             </div>
                                           ) : (
                                             <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{(subj.ccWeight * 100).toFixed(0)}% CC</span>
                                                <span className="text-slate-200">|</span>
                                                <span className="text-[10px] font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{(subj.examWeight * 100).toFixed(0)}% EXAM</span>
                                             </div>
                                           )}
                                        </td>
                                        <td className="py-3">
                                           {editingSubjectId === subj.id ? (
                                             <select 
                                               className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:border-primary"
                                               value={editSubjectData.teacherId || 'none'}
                                               onChange={(e) => setEditSubjectData({...editSubjectData, teacherId: e.target.value})}
                                             >
                                                <option value="none">Aucun enseignant</option>
                                                {teachers.map(t => <option key={t.id} value={t.id}>{t.lastName} {t.firstName}</option>)}
                                             </select>
                                           ) : (
                                              <div className="flex items-center gap-2">
                                                <User size={12} className="text-slate-300" />
                                                <span className="text-xs font-medium text-slate-600">
                                                  {subj.teacher ? `${subj.teacher.lastName} ${subj.teacher.firstName}` : 'Non assigné'}
                                                </span>
                                              </div>
                                           )}
                                        </td>
                                        <td className="py-3 text-right pr-4 rounded-r-xl">
                                           {editingSubjectId === subj.id ? (
                                             <div className="flex items-center justify-end gap-2">
                                                <button onClick={handleSaveSubject} className="p-1.5 bg-emerald-500 text-white rounded-lg shadow-md hover:scale-110 transition-all"><Save size={14} /></button>
                                                <button onClick={() => setEditingSubjectId(null)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:scale-110 transition-all"><X size={14} /></button>
                                             </div>
                                           ) : (
                                             <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => handleEditSubject(subj)} className="p-2 text-slate-400 hover:text-primary transition-all"><Edit3 size={16} /></button>
                                                <button onClick={() => handleDeleteSubject(subj.id)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                                             </div>
                                           )}
                                        </td>
                                     </tr>
                                   ))}
                                   <tr>
                                      <td colSpan={6} className="pt-2">
                                         <button 
                                            onClick={() => { setTargetUEId(ue.id); setShowSubjectModal(true); }}
                                            className="w-full py-2 border-2 border-dashed border-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-300 hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-2"
                                          >
                                            <Plus size={12} /> Ajouter une matière
                                         </button>
                                      </td>
                                   </tr>
                                 </tbody>
                              </table>
                           </div>
                         )}
                      </div>
                    ))}
                 </div>
               )}
            </div>
          ))}
        </div>
      )}

      {/* Regulation Card */}
      <form onSubmit={handleSaveRules} className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex flex-col gap-5">
         <div className="flex gap-5">
           <div className="bg-white p-3 rounded-2xl shadow-sm h-fit text-primary">
              <Percent size={24} />
           </div>
           <div className="space-y-2">
              <h4 className="font-bold text-blue-900 leading-tight">Règles de gestion (paramétrables)</h4>
              <p className="text-sm text-blue-700/80 leading-relaxed max-w-3xl">
                Ces paramètres pilotent les calculs globaux : pénalité d&apos;absence et règle de reprise de soutenance.
              </p>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pénalité / heure d&apos;absence</label>
             <input
               type="number"
               step="0.01"
               min="0"
               className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold"
               value={rulesSettings.absencePenaltyPerHour}
               onChange={(e) => setRulesSettings({ ...rulesSettings, absencePenaltyPerHour: parseFloat(e.target.value) || 0 })}
             />
           </div>
           <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Code UE soutenance</label>
             <input
               type="text"
               className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold"
               value={rulesSettings.soutenanceUeCode}
               onChange={(e) => setRulesSettings({ ...rulesSettings, soutenanceUeCode: e.target.value })}
             />
           </div>
           <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reprise soutenance active</label>
             <select
               className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-700"
               value={rulesSettings.enableSoutenanceRetake ? 'true' : 'false'}
               onChange={(e) => setRulesSettings({ ...rulesSettings, enableSoutenanceRetake: e.target.value === 'true' })}
             >
               <option value="true">Oui</option>
               <option value="false">Non</option>
             </select>
           </div>
         </div>

         <div className="flex justify-end">
           <button
             type="submit"
             disabled={isSubmitting}
             className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-60"
           >
             <Save size={16} />
             Enregistrer les règles
           </button>
         </div>
      </form>

      {showUEModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
           <div className="glass-card w-full max-w-md p-8 border-white/60 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Nouvelle UE</h3>
                 <button onClick={() => setShowUEModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleCreateUE} className="space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de l'UE</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold"
                      value={newUEData.name}
                      onChange={(e) => setNewUEData({...newUEData, name: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code</label>
                       <input 
                         type="text" 
                         required
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold"
                         value={newUEData.code}
                         onChange={(e) => setNewUEData({...newUEData, code: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Crédits</label>
                       <input 
                         type="number" 
                         required
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold"
                         value={newUEData.credits}
                         onChange={(e) => setNewUEData({...newUEData, credits: parseInt(e.target.value) || 0})}
                       />
                    </div>
                 </div>

                 <button 
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full bg-primary text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                 >
                   Créer l'UE
                 </button>
              </form>
           </div>
        </div>
      )}

      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
           <div className="glass-card w-full max-w-md p-8 border-white/60 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Nouvelle Matière</h3>
                 <button onClick={() => setShowSubjectModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleCreateSubject} className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Intitulé</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm font-bold"
                      value={newSubjectData.name}
                      onChange={(e) => setNewSubjectData({...newSubjectData, name: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Coeff</label>
                       <input 
                         type="number" 
                         step="0.1"
                         required
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-sm font-bold"
                         value={newSubjectData.coefficient}
                         onChange={(e) => setNewSubjectData({...newSubjectData, coefficient: parseFloat(e.target.value) || 0})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Crédits</label>
                       <input 
                         type="number" 
                         required
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-sm font-bold"
                         value={newSubjectData.credits}
                         onChange={(e) => setNewSubjectData({...newSubjectData, credits: parseInt(e.target.value) || 0})}
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enseignant</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-700"
                      value={newSubjectData.teacherId}
                      onChange={(e) => setNewSubjectData({...newSubjectData, teacherId: e.target.value})}
                    >
                       <option value="">Non assigné</option>
                       {teachers.map(t => <option key={t.id} value={t.id}>{t.lastName} {t.firstName}</option>)}
                    </select>
                 </div>

                 <button 
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full bg-primary text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                 >
                   Créer la matière
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value }: { label: string, value: any }) {
  return (
    <div className="flex items-center gap-1.5">
       <span className="text-[10px] font-black uppercase text-slate-300 tracking-tight">{label}:</span>
       <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-xs font-bold text-slate-600 border border-white">
          {value}
       </span>
    </div>
  );
}
