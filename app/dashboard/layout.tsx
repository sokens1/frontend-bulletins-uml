'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  UserCircle, 
  FileText, 
  PenTool, 
  LogOut, 
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 glass-card m-4 mr-0 border-none rounded-3xl hidden md:flex flex-col p-6 shadow-xl sticky top-4 h-[calc(100vh-2rem)]">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-primary p-2 rounded-xl">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">UML Portal</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-600 transition-all hover:text-primary font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Tableau de bord
          </button>

          {user.role === 'ADMIN' && (
            <>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2 px-3">Administration</div>
              <button onClick={() => router.push('/dashboard/admin/marks')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-600 transition-all hover:text-primary font-medium">
                <PenTool className="w-5 h-5" />
                Saisie des notes
              </button>
              <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-600 transition-all hover:text-primary font-medium">
                <ShieldCheck className="w-5 h-5" />
                Gestion Étudiants
              </button>
            </>
          )}

          {user.role === 'STUDENT' && (
            <>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2 px-3">Mon Espace</div>
              <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-600 transition-all hover:text-primary font-medium">
                <FileText className="w-5 h-5" />
                Mes Bulletins
              </button>
            </>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-2">
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-slate-600 transition-all font-medium">
            <UserCircle className="w-5 h-5" />
            Mon Profil
          </button>
          <button onClick={logout} className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-all font-semibold">
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm">
          <div>
            <h2 className="text-xl font-bold">Bonjour, {user.email.split('@')[0]}</h2>
            <p className="text-xs text-muted">Aujourd'hui est un bon jour pour étudier.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold">{user.email}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-opacity-10 ${user.role === 'ADMIN' ? 'bg-amber-500 text-amber-600' : 'bg-blue-500 text-blue-600'}`}>
                {user.role}
              </span>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <UserCircle className="text-slate-500 w-6 h-6" />
            </div>
          </div>
        </header>

        <div className="fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
