import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'orange' | 'green' | 'red' | 'blue' | 'purple';
  isCurrency?: boolean;
}

const VARIANTS = {
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
    border: 'border-orange-500/20',
    iconBg: 'bg-orange-500',
    gradient: 'from-orange-500 to-red-500'
  },
  green: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500',
    gradient: 'from-emerald-400 to-emerald-600'
  },
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500',
    gradient: 'from-red-500 to-rose-600'
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500',
    gradient: 'from-blue-400 to-indigo-500'
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500',
    gradient: 'from-purple-400 to-fuchsia-500'
  }
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, variant, isCurrency = true }) => {
  const style = VARIANTS[variant];

  return (
    <div className={`relative overflow-hidden bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-xl transition-transform hover:-translate-y-1`}>
      {/* Background Glow Effect */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${style.bg} blur-2xl opacity-50 pointer-events-none`}></div>

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-100 tracking-tight">
            {isCurrency 
              ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
              : value}
          </h3>
        </div>
        
        <div className={`p-3 rounded-xl bg-gradient-to-br ${style.gradient} shadow-lg shadow-black/30`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {/* Decorative Line */}
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${style.gradient} opacity-20`}></div>
    </div>
  );
};