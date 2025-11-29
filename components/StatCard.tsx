import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
  isCurrency?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass, isCurrency = true }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">
          {isCurrency 
            ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
            : value}
        </h3>
      </div>
    </div>
  );
};