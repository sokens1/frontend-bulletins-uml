'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ShieldCheck, 
  BookOpen, 
  Briefcase, 
  Trash2, 
  Mail, 
  Shield, 
  X,
  Check,
  AlertCircle,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { userService, academicService } from '../../../services/api';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form state
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    role: 'TEACHER',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [data, subjectsData] = await Promise.all([
        userService.getStaff(),
        academicService.getStructure().then(res => res.flatMap((s: any) => s.ues.flatMap((u: any) => u.subjects)))
      ]);
      setUsers(data);
      setSubjects(subjectsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newUserData.role === 'TEACHER') {
        await userService.createTeacher({ ...newUserData, subjectIds: selectedSubjectIds });
      } else {
        await userService.createSecretary(newUserData);
      }
      showNotification('success', 'Utilisateur créé avec succès');
      setIsAddModalOpen(false);
      setNewUserData({ email: '', password: '', role: 'TEACHER', firstName: '', lastName: '' });
      setSelectedSubjectIds([]);
      fetchUsers();
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur lors de la création');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
       // Since the backend uses User entity for auth, we delete the User
       await userService.deleteStaff(id);
       showNotification('success', 'Utilisateur supprimé');
       fetchUsers();
    } catch (err) {
      showNotification('error', 'Erreur lors de la suppression');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || 
                         (u.teacher?.lastName + ' ' + u.teacher?.firstName).toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole ? u.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <ShieldCheck className="text-primary" size={18} />;
      case 'TEACHER': return <BookOpen className="text-emerald-500" size={18} />;
      case 'SECRETARY': return <Briefcase className="text-purple-500" size={18} />;
      default: return <Users size={18} />;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="text-primary w-8 h-8" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-400 text-sm font-medium">Administrez les rôles et les accès de l'équipe académique.</p>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <UserPlus size={18} />
          Nouvel Utilisateur
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

      {/* Filters Bar */}
      <div className="glass-card p-4 border-white/60 shadow-xl flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par email, nom ou prénom..."
              className="w-full bg-white/60 border-2 border-white/80 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <div className="flex gap-2">
            <button 
              onClick={() => setFilterRole('')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!filterRole ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
            >
              Tous
            </button>
            <button 
              onClick={() => setFilterRole('TEACHER')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterRole === 'TEACHER' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
            >
              Enseignants
            </button>
            <button 
              onClick={() => setFilterRole('SECRETARY')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterRole === 'SECRETARY' ? 'bg-purple-500 text-white shadow-md' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
            >
              Secrétariat
            </button>
         </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden border-white/40 shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-white text-[10px] uppercase tracking-widest text-slate-400 font-black">
                     <th className="px-6 py-5">Identité / Email</th>
                     <th className="px-6 py-5">Rôle</th>
                     <th className="px-6 py-5">Date d'inscription</th>
                     <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="p-20 text-center"><div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-medium tracking-tight">Aucun utilisateur trouvé.</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/10 hover:bg-white/50 transition-all group">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-white">
                                  {user.teacher ? <BookOpen size={20} /> : <Shield size={20} />}
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-800">
                                    {user.teacher ? `${user.teacher.lastName} ${user.teacher.firstName}` : user.email.split('@')[0]}
                                  </span>
                                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                                    <Mail size={12} /> {user.email}
                                  </span>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               {getRoleIcon(user.role)}
                               <span className={`text-[10px] font-black uppercase tracking-widest ${
                                 user.role === 'ADMIN' ? 'text-primary' : 
                                 user.role === 'TEACHER' ? 'text-emerald-500' : 
                                 'text-purple-500'
                               }`}>
                                 {user.role}
                               </span>
                            </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs text-slate-400 font-bold">{new Date(user.createdAt).toLocaleDateString()}</span>
                         </td>
                         <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                   <Trash2 size={16} />
                                </button>
                                <button className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                   <MoreVertical size={16} />
                                </button>
                             </div>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
           <div className="glass-card w-full max-w-md p-8 border-white/60 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Nouvel Utilisateur</h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                       <input 
                         type="text" 
                         required
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-primary transition-all font-medium"
                         value={newUserData.lastName}
                         onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                       <input 
                         type="text" 
                         required
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-primary transition-all font-medium"
                         value={newUserData.firstName}
                         onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email académique</label>
                    <input 
                      type="email" 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary transition-all font-medium"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe provisoire</label>
                    <input 
                      type="password" 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary transition-all font-medium"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                    />
                 </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rôle assigné</label>
                    <div className="relative">
                       <select 
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none font-bold text-slate-700"
                         value={newUserData.role}
                         onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                       >
                          <option value="TEACHER">Enseignant</option>
                          <option value="SECRETARY">Secrétariat</option>
                       </select>
                       <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                 </div>

                 {newUserData.role === 'TEACHER' && (
                   <div className="space-y-1.5 animate-slide-down">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Matières assignées</label>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 max-h-32 overflow-y-auto space-y-2">
                        {subjects.map(s => (
                          <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox"
                              className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary/20"
                              checked={selectedSubjectIds.includes(s.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedSubjectIds([...selectedSubjectIds, s.id]);
                                else setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== s.id));
                              }}
                            />
                            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-800 transition-colors uppercase">{s.name}</span>
                          </label>
                        ))}
                      </div>
                   </div>
                 )}

                 <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-primary text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Confirmer la création
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
