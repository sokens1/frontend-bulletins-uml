'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export default function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  icon, 
  required = false 
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 p-4 bg-white border-2 rounded-2xl cursor-pointer transition-all
          ${isOpen ? 'border-primary ring-4 ring-primary/5 shadow-lg' : 'border-slate-100 hover:border-slate-200'}
        `}
      >
        <div className="text-slate-400">
          {icon || <Search size={20} />}
        </div>
        
        <div className="flex-1 overflow-hidden">
          {selectedOption ? (
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-slate-800 truncate">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-[10px] font-medium text-slate-400 truncate uppercase">{selectedOption.sublabel}</span>
              )}
            </div>
          ) : (
            <span className="text-sm text-slate-400 font-medium">{placeholder}</span>
          )}
        </div>

        <ChevronDown 
          size={18} 
          className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          <div className="p-3 border-b border-slate-50 bg-slate-50/50">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400" size={16} />
              <input 
                type="text"
                autoFocus
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-100 rounded-xl focus:outline-none focus:border-primary/30"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {search && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setSearch(''); }}
                  className="absolute right-3 text-slate-300 hover:text-slate-500"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucun résultat</p>
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div 
                  key={option.id}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`
                    flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-1
                    ${value === option.id ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-600'}
                  `}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{option.label}</span>
                    {option.sublabel && (
                      <span className={`text-[10px] font-medium uppercase ${value === option.id ? 'text-primary/60' : 'text-slate-400'}`}>
                        {option.sublabel}
                      </span>
                    )}
                  </div>
                  {value === option.id && <Check size={16} className="text-primary" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {required && !value && <input tabIndex={-1} autoComplete="off" style={{ opacity: 0, height: 0, position: 'absolute' }} required />}
    </div>
  );
}
