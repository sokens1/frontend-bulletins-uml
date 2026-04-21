'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, ArrowRight, BookOpen, Clock, FileCheck, LogIn } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b border-white/20 bg-white/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-primary uppercase">INPTIC UML</span>
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase -mt-1 underline decoration-secondary decoration-2 underline-offset-2">Portail Académique</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/register" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors hidden sm:block">
              S'inscrire
            </Link>
            <Link href="/login" className="btn-primary h-12 px-6 text-sm">
              <LogIn className="w-4 h-4" />
              Accès Portail
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 pb-24 px-6 flex-1 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="flex flex-col gap-8 fade-in">
            <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 w-fit">
              <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calcul automatique des crédits ECTS</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-[0.9] text-slate-900 tracking-tight">
              L'Excellence <br/>
              <span className="text-primary italic">Numérisée.</span>
            </h1>
            
            <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
              Simplifiez la gestion des notes et gagnez en précision. Une plateforme robuste conçue spécifiquement pour répondre aux exigences académiques de l'INPTIC Gabon.
            </p>

            <div className="flex flex-wrap gap-4 pt-6">
              <Link href="/login" className="btn-primary h-16 px-10 text-lg shadow-2xl shadow-primary/20">
                Commencer l'expérience
                <ArrowRight className="w-6 h-6" />
              </Link>
              <button className="px-10 h-16 rounded-2xl border-2 border-slate-200 font-black text-slate-600 hover:bg-slate-100 transition-all">
                Documentation
              </button>
            </div>
          </div>

          <div className="relative group p-4 lg:p-0">
             <div className="glass-card p-4 aspect-[4/3] relative z-10 border-white/60 shadow-3xl overflow-hidden animate-float">
                <div className="w-full h-full bg-slate-50 rounded-[2rem] border border-slate-100 p-8 flex flex-col gap-6">
                   <div className="h-8 bg-slate-200 rounded-full w-1/2 animate-pulse"></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col justify-end gap-2">
                         <div className="h-2 bg-primary/20 rounded-full w-1/3"></div>
                         <div className="h-4 bg-primary/10 rounded-full w-full"></div>
                      </div>
                      <div className="h-24 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col justify-end gap-2">
                         <div className="h-2 bg-success/20 rounded-full w-1/3"></div>
                         <div className="h-4 bg-success/10 rounded-full w-full"></div>
                      </div>
                   </div>
                   <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-inner p-6 flex flex-col gap-4">
                      <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                      <div className="h-4 bg-slate-50 rounded-full w-4/5"></div>
                      <div className="h-4 bg-slate-50 rounded-full w-3/4"></div>
                   </div>
                </div>
             </div>
             {/* Decorative spheres */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary rounded-full blur-[60px] opacity-20"></div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary rounded-full blur-[80px] opacity-10"></div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <FeatureCard 
               icon={<ShieldCheck className="w-7 h-7 text-primary" />}
               title="Saisie Sécurisée"
               desc="Protection totale des données académiques avec authentification JWT et rôles applicatifs."
             />
             <FeatureCard 
               icon={<BookOpen className="w-7 h-7 text-amber-500" />}
               title="Moyennes Précises"
               desc="Calculs automatiques incluant CC et examen, avec respect strict des pondérations officielles."
             />
             <FeatureCard 
               icon={<FileCheck className="w-7 h-7 text-success" />}
               title="Génération Rapide"
               desc="Bulletins PDF générés instantanément, conformes au spécimen administratif de l'INPTIC."
             />
           </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-primary py-24 px-6 text-center">
         <div className="max-w-4xl mx-auto flex flex-col gap-10">
            <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight">Prêt à moderniser votre gestion académique ?</h2>
            <Link href="/login" className="mx-auto bg-white text-primary px-10 h-16 rounded-[2rem] font-black text-lg flex items-center justify-center hover:scale-105 transition-all shadow-2xl shadow-black/30">
               Se connecter maintenant
            </Link>
         </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-12 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:shadow-2xl hover:bg-white transition-all duration-500 group">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-slate-800">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
