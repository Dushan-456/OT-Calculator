// src/components/Header.jsx
import React from 'react';
import { Clock } from 'lucide-react';

export default function Header() {
  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg backdrop-blur-sm shadow-inner border border-blue-400/30">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300 drop-shadow-md">
              Overtime Calculator
            </h1>
        </div>
      </div>
    </header>
  );
}
