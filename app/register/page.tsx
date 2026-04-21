'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, Calendar, MapPin, School, GraduationCap, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthDate: '',
    birthPlace: '',
    bacType: '',
    originSchool: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulation or actual API call
      // const response = await authService.register({ ...formData, role: 'STUDENT' });
      
      // Temporary success simulation
      setTimeout(() => {
        setSuccess(true);
        setIsLoading(false);
        setTimeout(() => router.push('/login'), 3000);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="glass-card max-w-md w-full p-10 text-center animate-bounce-subtle">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Inscription réussie !</h1>
          <p className="text-slate-500 mb-8">Votre compte étudiant a été créé. Vous allez être redirigé vers la page de connexion.</p>
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-20 px-6 bg-slate-50 flex items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="glass-card w-full max-w-2xl p-10 fade-in relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inscription Étudiant</h1>
          <p className="text-slate-500 text-sm mt-1">Créez votre accès au portail universitaire INPTIC</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {error && (
            <div className="col-span-full bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Informations Civiles */}
          <div className="col-span-full text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">
            Identité & Accès
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Nom & Prénom</label>
            <div className="relative flex items-center">
              <User className="absolute left-4 w-4 h-4 text-slate-400" />
              <input 
                type="text" required className="input-field pl-11 py-3 text-sm" placeholder="Ex: Jean Dupont"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Adresse Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-slate-400" />
              <input 
                type="email" required className="input-field pl-11 py-3 text-sm" placeholder="Ex: jean.dupont@inptic.ga"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 col-span-full">
            <label className="label">Mot de passe</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-4 h-4 text-slate-400" />
              <input 
                type="password" required className="input-field pl-11 py-3 text-sm" placeholder="••••••••"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {/* Détails Académiques (Spec 5.1) */}
          <div className="col-span-full text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-2 border-b border-slate-100 pb-2">
            Informations Académiques (Cahier des Charges)
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Date de naissance</label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-4 w-4 h-4 text-slate-400" />
              <input 
                type="date" required className="input-field pl-11 py-3 text-sm"
                value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Lieu de naissance</label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-4 w-4 h-4 text-slate-400" />
              <input 
                type="text" required className="input-field pl-11 py-3 text-sm" placeholder="Ex: Libreville"
                value={formData.birthPlace} onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Type de Baccalauréat</label>
            <div className="relative flex items-center">
              <GraduationCap className="absolute left-4 w-4 h-4 text-slate-400" />
              <select 
                required className="input-field pl-11 py-3 text-sm appearance-none cursor-pointer"
                value={formData.bacType} onChange={(e) => setFormData({...formData, bacType: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                <option value="C">Série C</option>
                <option value="D">Série D</option>
                <option value="E">Série E</option>
                <option value="TI">Série TI</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Établissement d'origine</label>
            <div className="relative flex items-center">
              <School className="absolute left-4 w-4 h-4 text-slate-400" />
              <input 
                type="text" required className="input-field pl-11 py-3 text-sm" placeholder="Ex: Lycée Technique"
                value={formData.originSchool} onChange={(e) => setFormData({...formData, originSchool: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary col-span-full h-14 mt-6 text-base"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Créer mon compte étudiant</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Déjà un compte ? <Link href="/login" className="text-primary font-bold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
