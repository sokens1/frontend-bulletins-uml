'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  UserCircle, 
  FileText, 
  PenTool, 
  LogOut, 
  ShieldCheck,
  GraduationCap,
  ChevronRight,
  Users,
  Clock,
  History,
  BarChart3,
  BookOpen,
  UserPlus
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold tracking-wide">Initialisation de votre session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800">
      {/* Sidebar - Responsive icon-only to full width */}
      <aside className="w-20 lg:w-80 flex flex-col p-2 lg:p-6 sticky top-0 h-screen transition-all duration-300 border-r border-slate-200 lg:border-none bg-white lg:bg-transparent z-40 shrink-0">
        <div className="lg:glass-card h-full min-h-0 flex flex-col lg:p-6 lg:shadow-xl lg:border-white/50">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-8 lg:mb-12 px-1 lg:px-2">
            <div className="bg-white p-2 rounded-2xl shadow-sm lg:shadow-lg border border-slate-100 flex-shrink-0">
              <Image src="/logo-inptic.png" alt="INPTIC" width={44} height={44} priority className="w-8 h-8 lg:w-11 lg:h-11" />
            </div>
            <div className="hidden lg:flex flex-col leading-tight">
              <span className="font-black text-base tracking-tight text-slate-800">INPTIC</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portail Bulletins</span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <nav className="flex flex-col gap-2">
              <NavItem 
                icon={<LayoutDashboard />} 
                label="Tableau de bord" 
                onClick={() => router.push('/dashboard')} 
                active={pathname === '/dashboard'}
              />

            {(user.role === 'ADMIN' || user.role === 'TEACHER' || user.role === 'SECRETARY') && (
              <>
                <div className="hidden lg:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 lg:mt-8 mb-2 lg:mb-3 px-4">Scolarité</div>
                <div className="lg:hidden h-px bg-slate-100 my-2 mx-2"></div>
                <NavItem 
                  icon={<PenTool />} 
                  label="Saisie des notes" 
                  onClick={() => router.push('/dashboard/admin/marks')} 
                  active={pathname === '/dashboard/admin/marks'}
                />
              </>
            )}

            {(user.role === 'ADMIN' || user.role === 'SECRETARY') && (
              <>
                <div className="hidden lg:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 lg:mt-8 mb-2 lg:mb-3 px-4">Administration</div>
                <div className="lg:hidden h-px bg-slate-100 my-2 mx-2"></div>
                <NavItem 
                  icon={<Clock />} 
                  label="Gestion Absences" 
                  onClick={() => router.push('/dashboard/admin/absences')}
                  active={pathname === '/dashboard/admin/absences'}
                />
                <NavItem 
                  icon={<BarChart3 />} 
                  label="Suivi Promotion" 
                  onClick={() => router.push('/dashboard/admin/promotion')}
                  active={pathname === '/dashboard/admin/promotion'}
                />
                {user.role === 'ADMIN' && (
                  <NavItem 
                    icon={<Users />} 
                    label="Gestion Étudiants" 
                    onClick={() => router.push('/dashboard/admin/students')}
                    active={pathname === '/dashboard/admin/students'}
                  />
                )}
                {user.role === 'ADMIN' && (
                  <NavItem 
                    icon={<History />} 
                    label="Audit Sécurité" 
                    onClick={() => router.push('/dashboard/admin/audit')}
                    active={pathname === '/dashboard/admin/audit'}
                  />
                )}
                {user.role === 'ADMIN' && (
                  <NavItem 
                    icon={<BookOpen size={20} />} 
                    label="Gestion Académique" 
                    onClick={() => router.push('/dashboard/admin/academic')}
                    active={pathname === '/dashboard/admin/academic'}
                  />
                )}
                {user.role === 'ADMIN' && (
                  <NavItem 
                    icon={<UserPlus size={20} />} 
                    label="Gestion Utilisateurs" 
                    onClick={() => router.push('/dashboard/admin/users')}
                    active={pathname === '/dashboard/admin/users'}
                  />
                )}
              </>
            )}

              {user.role === 'STUDENT' && (
                <>
                  <div className="hidden lg:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 lg:mt-8 mb-2 lg:mb-3 px-4">Résultats</div>
                  <div className="lg:hidden h-px bg-slate-100 my-2 mx-2"></div>
                  <NavItem 
                    icon={<FileText />} 
                    label="Mes Bulletins" 
                    onClick={() => router.push('/dashboard/student/bulletins')} 
                    active={pathname === '/dashboard/student/bulletins'}
                  />
                </>
              )}
            </nav>

            <div className="pt-4 lg:pt-6 mt-auto lg:mt-6 border-t border-slate-100 flex flex-col gap-2">
              <Link href="/dashboard/profile" className="group flex items-center justify-center lg:justify-between p-3 rounded-xl hover:bg-slate-50 transition-all" title="Mon Profil">
                <div className="flex items-center gap-3 text-slate-600 group-hover:text-primary transition-colors">
                  <UserCircle className="w-6 h-6 lg:w-5 lg:h-5" />
                  <span className="hidden lg:block text-sm font-semibold">Mon Profil</span>
                </div>
                <ChevronRight className={`hidden lg:block w-4 h-4 transition-all ${pathname === '/dashboard/profile' ? 'text-primary opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
              </Link>
              <button 
                onClick={logout} 
                title="Déconnexion"
                className="flex items-center justify-center lg:justify-start gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold text-sm"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden lg:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full overflow-hidden flex flex-col gap-4 lg:gap-8 min-h-screen p-3 sm:p-4 lg:p-8">
        <header className="flex justify-between items-center bg-white lg:glass-card px-4 lg:px-8 py-3 lg:h-20 rounded-[1.5rem] lg:border-white/40 shadow-sm lg:shadow-premium">
          <div className="flex flex-col">
            <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 truncate max-w-[150px] sm:max-w-xs">Bienvenue, {user.email.split('@')[0]}</h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-success rounded-full flex-shrink-0"></span>
               <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Session Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-bold text-slate-900">{user.email}</p>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                user.role === 'ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {user.role}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
               <UserCircle className="w-7 h-7" />
            </div>
          </div>
        </header>

        <section className="flex-1 fade-in">
          {children}
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, label, onClick, active = false, disabled = false }: { icon: any, label: string, onClick?: () => void, active?: boolean, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`
        flex items-center justify-center lg:justify-start gap-3 p-3 lg:p-3.5 rounded-xl lg:rounded-2xl transition-all duration-300 group
        ${active ? 'bg-primary/10 lg:bg-primary/5 text-primary shadow-sm shadow-primary/5' : 'text-slate-500 hover:bg-slate-50 hover:text-primary'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <span className="hidden lg:block text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
        {label}
      </span>
      {active && <div className="hidden lg:block ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,51,102,0.5)]"></div>}
    </button>
  );
}
