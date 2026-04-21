'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  BookOpen, 
  Calendar, 
  Key, 
  Camera, 
  Check, 
  AlertCircle,
  LogOut,
  GraduationCap,
  MapPin
} from 'lucide-react';
import { userService } from '../../services/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
    } catch (err) {
      showNotification('error', 'Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const roleLabels: any = {
    'ADMIN': 'Administrateur Système',
    'SECRETARY': 'Secrétaire Académique',
    'TEACHER': 'Enseignant / Docteur',
    'STUDENT': 'Étudiant'
  };

  const getInitials = () => {
    const name = profile.student ? `${profile.student.lastName} ${profile.student.firstName}` :
                 profile.teacher ? `${profile.teacher.lastName} ${profile.teacher.firstName}` :
                 profile.email.split('@')[0];
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden glass-card border-white/60 shadow-2xl p-0">
         {/* Banner Background */}
         <div className="h-40 bg-gradient-to-r from-primary to-primary-dark relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         </div>

         <div className="px-8 pb-8 -mt-12 relative flex flex-col md:flex-row items-end gap-6">
            <div className="relative group">
               <div className="w-32 h-32 rounded-3xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-primary overflow-hidden">
                  {getInitials()}
               </div>
               <button className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                  <Camera size={16} />
               </button>
            </div>

            <div className="flex-1 pb-2">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                       {profile.student ? `${profile.student.lastName} ${profile.student.firstName}` :
                        profile.teacher ? `${profile.teacher.lastName} ${profile.teacher.firstName}` :
                        profile.email.split('@')[0]}
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20 flex items-center gap-1.5">
                          <Shield size={12} />
                          {roleLabels[profile.role] || profile.role}
                       </span>
                       <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                          <Mail size={14} /> {profile.email}
                       </span>
                    </div>
                  </div>
                  <button className="bg-white hover:bg-slate-50 text-slate-600 px-6 py-2.5 rounded-2xl text-sm font-bold border border-slate-100 transition-all flex items-center gap-2 shadow-sm">
                     Modifier mon profil
                  </button>
               </div>
            </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Sidebar info */}
         <div className="md:col-span-1 space-y-6">
            <div className="glass-card p-6 border-white/60 shadow-xl">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Informations de compte</h3>
               <div className="space-y-4">
                  <InfoItem icon={<User size={16} />} label="Identifiant" value={profile.id.substring(0, 8)} />
                  <InfoItem icon={<Calendar size={16} />} label="Membre depuis" value={new Date(profile.createdAt).toLocaleDateString()} />
                  <InfoItem icon={<MapPin size={16} />} label="Localisation" value="Libreville, Gabon (INPTIC)" />
               </div>
            </div>

            <div className="glass-card p-6 border-white/60 shadow-xl bg-slate-900 border-none">
               <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 px-1">Sécurité</h3>
               <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group border border-white/5">
                     <div className="flex items-center gap-3">
                        <Key size={18} className="text-primary" />
                        <span className="text-sm font-bold text-white">Changer mot de passe</span>
                     </div>
                  </button>
                  <button 
                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-red-500/10 transition-all group border border-transparent hover:border-red-500/20"
                  >
                     <div className="flex items-center gap-3 text-red-400">
                        <LogOut size={18} />
                        <span className="text-sm font-bold">Déconnexion</span>
                     </div>
                  </button>
               </div>
            </div>
         </div>

         {/* Main Details */}
         <div className="md:col-span-2 space-y-6">
            {profile.student && (
               <div className="glass-card p-8 border-white/60 shadow-xl space-y-6">
                  <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                     <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><GraduationCap size={24} /></div>
                     <div>
                        <h3 className="font-black text-slate-800 tracking-tight">Parcours Académique</h3>
                        <p className="text-xs text-slate-400 font-medium tracking-tight">Détails de votre inscription actuelle.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matricule Étudiant</p>
                        <p className="text-lg font-black text-slate-800">{profile.student.studentId || 'N/A'}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classe / Niveau</p>
                        <p className="text-lg font-black text-slate-800 uppercase tracking-tight">{profile.student.class}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date de naissance</p>
                        <p className="text-lg font-black text-slate-800">{new Date(profile.student.birthDate).toLocaleDateString()}</p>
                     </div>
                  </div>
               </div>
            )}

            {profile.teacher && (
               <div className="glass-card p-8 border-white/60 shadow-xl space-y-6">
                  <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                     <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><BookOpen size={24} /></div>
                     <div>
                        <h3 className="font-black text-slate-800 tracking-tight">Domaine d'enseignement</h3>
                        <p className="text-xs text-slate-400 font-medium tracking-tight">Matières et responsabilités assignées.</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matières sous votre charge</p>
                     <div className="flex flex-wrap gap-2">
                        {profile.teacher.subjects?.length > 0 ? profile.teacher.subjects.map((s: any) => (
                           <span key={s.id} className="bg-slate-100 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl border border-white uppercase tracking-tight">
                              {s.name}
                           </span>
                        )) : (
                           <p className="text-sm font-medium text-slate-400 italic">Aucune matière assignée pour le moment.</p>
                        )}
                     </div>
                  </div>
               </div>
            )}

            <div className="glass-card p-8 border-green-100/50 shadow-xl bg-emerald-50/20 border-emerald-100/30">
               <h3 className="text-sm font-black text-emerald-800 tracking-tight mb-2">Statut du compte : ACTIF</h3>
               <p className="text-xs text-emerald-700/70 font-medium leading-relaxed">
                  Votre compte est en règle avec le système central de l'INPTIC. Vos droits d'accès sont définis par votre rôle académique. 
                  En cas de problème d'accès, veuillez contacter le service informatique.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3 group">
       <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all border border-slate-100 group-hover:border-primary">
          {icon}
       </div>
       <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
          <span className="text-sm font-bold text-slate-700">{value}</span>
       </div>
    </div>
  );
}
