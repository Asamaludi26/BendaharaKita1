import React from 'react';
import { View } from '../types';
import { DashboardIcon, ProfileIcon, ManagementIcon, TransactionsIcon } from './icons';

interface BottomNavProps {
  activeView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{
  view: View;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ view, label, Icon, isActive, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-transform transform hover:scale-110">
    <Icon className={`w-7 h-7 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
    <span className={`text-sm font-medium transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-400'}`}>{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-gray-900 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.2)] flex items-center justify-around z-40">
      <NavItem
        view={View.DASHBOARD}
        label="Dashboard"
        Icon={DashboardIcon}
        isActive={activeView === View.DASHBOARD}
        onClick={() => setView(View.DASHBOARD)}
      />
      <NavItem
        view={View.TRANSACTIONS}
        label="Transaksi"
        Icon={TransactionsIcon}
        isActive={activeView === View.TRANSACTIONS}
        onClick={() => setView(View.TRANSACTIONS)}
      />
      {/* Revised Add button for better UX and design matching */}
      <div className="w-20 h-24 flex items-center justify-center">
        <button 
          onClick={() => setView(View.ADD)} 
          className="w-14 h-24 bg-gradient-to-b from-purple-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg -mt-10 transform hover:scale-105 transition-transform duration-300 ring-4 ring-gray-900"
        >
          <span className="text-4xl font-thin">+</span>
        </button>
      </div>
      <NavItem
        view={View.MANAGEMENT}
        label="Manajemen"
        Icon={ManagementIcon}
        isActive={activeView === View.MANAGEMENT}
        onClick={() => setView(View.MANAGEMENT)}
      />
      <NavItem
        view={View.PROFILE}
        label="Profil"
        Icon={ProfileIcon}
        isActive={activeView === View.PROFILE}
        onClick={() => setView(View.PROFILE)}
      />
    </div>
  );
};

export default BottomNav;