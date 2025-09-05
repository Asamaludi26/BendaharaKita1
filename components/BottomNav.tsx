import React from 'react';
import { View } from '../types';
import { DashboardIcon, ProfileIcon, ManagementIcon, TransactionsIcon, ReportIcon } from './icons';

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
    <Icon className={`w-7 h-7 transition-colors ${isActive ? 'text-[var(--primary-400)]' : 'text-gray-400'}`} />
    <span className={`text-sm font-medium transition-colors ${isActive ? 'text-[var(--primary-400)]' : 'text-gray-400'}`}>{label}</span>
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
      <NavItem
        view={View.REPORT}
        label="Lapor"
        Icon={ReportIcon}
        isActive={activeView === View.REPORT}
        onClick={() => setView(View.REPORT)}
      />
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