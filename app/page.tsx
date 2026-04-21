'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, ArrowRight, BookOpen, Clock, FileCheck, LogIn } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">INPTIC UML</span>
          </div>
          <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
            <LogIn className="w-4 h-4" />
            Accès Portail
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8 fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Système Académique Officiel
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-slate-900">
              Modernisons la <span className="text-primary">Gestion Académique.</span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Une plateforme centralisée pour la saisie automatique des notes, la validation des crédits ECTS et la génération instantanée des bulletins officiels conformes.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/login" className="btn-primary h-14 px-8 text-base">
                Commencer maintenant
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="px-8 h-14 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 transition-all text-slate-600">
                En savoir plus
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Rejoint par plus de <span className="text-primary font-bold">500+ étudiants</span> à Libreville.
              </p>
            </div>
          </div>

          <div className="relative group perspective">
            <div className="glass-card p-4 rotate-3 group-hover:rotate-0 transition-all duration-700 shadow-2xl relative z-10 overflow-hidden bg-white/40">
              <div className="bg-slate-50 rounded-2xl w-full aspect-[4/3] flex flex-col items-center justify-center border border-slate-100 overflow-hidden">
                <div className="w-full bg-primary/5 p-4 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="p-8 flex flex-col gap-6 w-full">
                   <div className="h-6 bg-slate-200 rounded-full w-2/3 animate-pulse"></div>
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
                   <div className="h-40 bg-white rounded-3xl border border-slate-100 shadow-sm"></div>
                </div>
              </div>
            </div>
            
            {/* Background floating elements */}
            <div className="absolute -top-10 -right-10 bg-secondary/20 w-32 h-32 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 bg-primary/10 w-48 h-48 rounded-full blur-3xl"></div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
            <h2 className="text-4xl font-bold">Un outil conçu pour l'excellence.</h2>
            <p className="text-slate-500">
              Découvrez les fonctionnalités qui simplifient la vie académique des enseignants et des étudiants de l'INPTIC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="text-primary w-6 h-6" />}
              title="Données Sécurisées"
              description="Authentification robuste et gestion des rôles pour garantir l'intégrité des notes et des bulletins."
            />
            <FeatureCard 
              icon={<BookOpen className="text-amber-500 w-6 h-6" />}
              title="Calcul Automatisé"
              description="Moyennes, crédits ECTS et mentions sont calculés instantanément selon les règles de calcul officielles."
            />
            <FeatureCard 
              icon={<FileCheck className="text-success w-6 h-6" />}
              title="Conformité Totale"
              description="Chaque bulletin généré respecte scrupuleusement le spécimen de l'INPTIC (Gabon)."
            />
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-primary py-24 text-center px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-8 text-white">
          <h2 className="text-4xl font-bold">Prêt à transformer la gestion de vos notes ?</h2>
          <p className="text-blue-100 text-lg">
            Rejoignez l'ère numérique de l'INPTIC avec un système fiable, rapide et précis.
          </p>
          <Link href="/login" className="mx-auto bg-white text-primary px-10 h-14 rounded-xl flex items-center justify-center font-bold text-lg hover:bg-blue-50 transition-all shadow-xl">
            S'inscrire / Se connecter
          </Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
      <div className="bg-slate-50 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
