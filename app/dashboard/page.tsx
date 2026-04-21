'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-primary to-blue-600 rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2 max-w-lg">
          <h1 className="text-3xl font-bold">Heureux de vous revoir !</h1>
          <p className="opacity-90">
            {isAdmin 
              ? "Gérez les notes, les étudiants et les bulletins en toute simplicité depuis votre interface administrateur."
              : "Consultez vos notes en temps réel et téléchargez vos bulletins officiels."
            }
          </p>
          <div className="mt-4 flex gap-3">
            <Link 
              href={isAdmin ? "/dashboard/admin/marks" : "/dashboard/student/bulletins"}
              className="bg-white text-primary px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-opacity-90 transition-all"
            >
              {isAdmin ? "Saisir des notes" : "Mes Notes"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 backdrop-blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/4"></div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="text-blue-500" />} 
          label="Étudiants" 
          value="120" 
          change="+5 ce semestre" 
        />
        <StatCard 
          icon={<BookOpen className="text-amber-500" />} 
          label="Unités d'Ens." 
          value="12" 
          change="02 Semestres" 
        />
        <StatCard 
          icon={<CheckCircle className="text-success" />} 
          label="Validés" 
          value="95%" 
          change="Taux de réussite" 
        />
        <StatCard 
          icon={<TrendingUp className="text-primary" />} 
          label="Moyenne" 
          value="14.5" 
          change="Globale" 
        />
      </div>

      {/* Quick Actions / Recent activity placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 min-h-[300px]">
          <h3 className="text-lg font-bold mb-4">Activité Récente</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 border-b border-slate-50">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <p className="text-sm flex-1">Nouveaux bulletins générés pour le Semestre 5</p>
              <span className="text-[10px] text-muted font-bold">Il y a 2h</span>
            </div>
            <div className="flex items-center gap-4 p-4 border-b border-slate-50">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <p className="text-sm flex-1">Correction des notes effectuée par l'Admin</p>
              <span className="text-[10px] text-muted font-bold">Hier</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4 text-center">Calendrier</h3>
          <div className="w-full aspect-square border border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-muted italic text-sm">
            Module Calendrier
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change }: { icon: React.ReactNode, label: string, value: string, change: string }) {
  return (
    <div className="glass-card p-6 flex flex-col gap-4 hover:shadow-lg transition-all cursor-default group">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white group-hover:shadow-sm transition-all">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{change}</span>
      </div>
      <div>
        <p className="text-muted text-xs font-bold uppercase tracking-wider">{label}</p>
        <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
      </div>
    </div>
  );
}
