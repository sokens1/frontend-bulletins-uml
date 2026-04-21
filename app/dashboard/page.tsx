'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  TrendingUp,
  ArrowRight,
  Zap,
  Clock,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { userService, academicService, gradesService } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    studentCount: 0,
    ueCount: 0,
    successRate: 0,
    average: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [activeSemesterName, setActiveSemesterName] = useState('Semestre en cours');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const isStaff = user.role === 'ADMIN' || user.role === 'SECRETARY' || user.role === 'TEACHER';
      
      // 1. Get Students Count (Restricted to Staff)
      let students: any[] = [];
      if (isStaff) {
        students = await userService.getStudents();
      }
      
      // 2. Get Academic Structure
      const structure = await academicService.getStructure();
      let totalUEs = 0;
      structure.forEach((sem: any) => {
        totalUEs += sem.ues.length;
      });

      if (structure.length > 0) {
        setActiveSemesterName(structure[0].name);
      }

      // 3. Get Stats for the active semester
      let semesterStats = { classAverage: 0, successRate: 0 };
      if (structure.length > 0 && isStaff) {
        try {
          const res = await gradesService.getPromotionStats(structure[0].id);
          const admitted = res.studentResults?.filter((r: any) => r.semesterAverage >= 10).length || 0;
          const total = res.count || 1;
          semesterStats = {
            classAverage: res.classAverage || 0,
            successRate: parseFloat(((admitted / total) * 100).toFixed(1))
          };
        } catch (e) {
          console.error("Could not fetch semester stats", e);
        }
      }

      // 4. Get Latest Activities (Restricted to Staff)
      let latestLogs: any[] = [];
      if (isStaff) {
        try {
          const logs = await userService.getAuditLogs();
          latestLogs = logs.slice(0, 5).map((log: any) => ({
            title: log.action,
            desc: `${log.user?.email.split('@')[0]} a effectué une action sur ${log.entity}`,
            time: formatTimeAgo(new Date(log.timestamp)),
            type: log.action.includes('UPDATE') ? 'edit' : log.action.includes('CREATE') ? 'success' : 'info'
          }));
        } catch (e) {
          console.error("Could not fetch audit logs", e);
        }
      }

      setStats({
        studentCount: isStaff ? students.length : 1,
        ueCount: totalUEs,
        successRate: isStaff ? semesterStats.successRate : 0, // Students don't see global success rate here
        average: isStaff ? semesterStats.classAverage : 0
      });
      setActivities(latestLogs);

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="flex flex-col gap-10">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-br from-primary via-blue-800 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col gap-4 max-w-xl fade-in">
          <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] w-fit border border-white/10">
            Portail Universitaire
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-none">
            Heureux de vous revoir, <br/>
            <span className="text-secondary">{user.email.split('@')[0]} !</span>
          </h1>
          <p className="text-blue-100/80 text-lg leading-relaxed">
            {isAdmin 
              ? `L'administration du ${activeSemesterName} est ouverte. Vous pouvez dès maintenant finaliser la saisie des notes.`
              : `Vos derniers résultats pour le ${activeSemesterName} sont disponibles. Votre bulletin officiel a été généré !`
            }
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link 
              href={isAdmin ? "/dashboard/admin/marks" : "/dashboard/student/bulletins"}
              className="bg-white text-primary px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:translate-x-1 transition-all shadow-xl shadow-black/10"
            >
              {isAdmin ? "Accéder à la saisie" : "Consulter mes notes"}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 backdrop-blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        <Zap className="absolute top-10 right-20 text-white/5 w-64 h-64 -rotate-12" />
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="text-blue-600" />} 
          label="Étudiants" 
          value={loading ? "..." : stats.studentCount.toString()} 
          change="Total inscrits" 
          color="blue"
        />
        <StatCard 
          icon={<BookOpen className="text-amber-500" />} 
          label="Unités d'Ens." 
          value={loading ? "..." : stats.ueCount.toString()} 
          change="Structure active" 
          color="amber"
        />
        <StatCard 
          icon={<CheckCircle className="text-green-500" />} 
          label="Taux de réussite" 
          value={loading ? "..." : `${stats.successRate}%`} 
          change="Semestre en cours" 
          color="green"
        />
        <StatCard 
          icon={<TrendingUp className="text-indigo-600" />} 
          label="Moyenne Générale" 
          value={loading ? "..." : stats.average.toFixed(2)} 
          change="Moyenne promo" 
          color="indigo"
        />
      </div>

      {/* Main Grid: Activity & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card p-10 flex flex-col gap-8 h-full">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Clock className="text-primary w-5 h-5" />
                Dernières Activités
              </h3>
              <Link href="/dashboard/admin/audit" className="text-xs font-bold text-primary hover:underline">Tout voir</Link>
            </div>
            
            <div className="flex flex-col gap-2">
              {loading ? (
                <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
                  <Loader2 className="animate-spin" /> Chargement des activités...
                </div>
              ) : activities.length === 0 ? (
                <p className="text-center p-12 text-slate-400 font-medium italic">Aucune activité récente.</p>
              ) : (
                activities.map((act, index) => (
                  <ActivityItem 
                    key={index}
                    title={act.title} 
                    desc={act.desc} 
                    time={act.time}
                    type={act.type}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-card p-10 flex flex-col gap-8 bg-primary text-white border-none shadow-primary/20">
             <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Portail Support</h3>
                <p className="text-blue-100/60 text-sm">En cas de problème technique sur vos bulletins.</p>
             </div>
             <button className="w-full bg-white/10 hover:bg-white/20 px-6 py-4 rounded-2xl font-bold text-sm transition-all border border-white/10">
                Ouvrir un ticket
             </button>
          </div>
          
          <div className="glass-card p-10 flex flex-col items-center justify-center text-center gap-4">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                <Users className="w-8 h-8" />
             </div>
             <p className="text-sm font-bold text-slate-400 italic">Module Collaboratif<br/>Prochainement</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, color }: { icon: React.ReactNode, label: string, value: string, change: string, color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="glass-card p-8 flex flex-col gap-6 hover:-translate-y-1 transition-all duration-300 cursor-default group overflow-hidden relative">
      <div className={`w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-500`}>
        {React.cloneElement(icon as React.ReactElement, { size: 28 })}
      </div>
      <div>
        <h4 className="text-3xl font-bold text-slate-900 mb-1">{value}</h4>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] font-black px-2 py-1 bg-white/50 rounded-lg shadow-sm">{change}</span>
      </div>
    </div>
  );
}

function ActivityItem({ title, desc, time, type }: { title: string, desc: string, time: string, type: 'edit' | 'success' | 'info' }) {
  const typeStyles = {
    edit: 'bg-blue-500',
    success: 'bg-success',
    info: 'bg-amber-500'
  };

  return (
    <div className="flex gap-6 p-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
      <div className="flex flex-col items-center gap-2 mt-1">
        <div className={`w-2.5 h-2.5 ${typeStyles[type]} rounded-full group-hover:scale-150 transition-all`}></div>
        <div className="w-px flex-1 bg-slate-100"></div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-slate-800">{title}</span>
          <span className="text-[10px] font-black text-slate-300 uppercase shrink-0">{time}</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}
