import React from 'react';
import { View } from '../types';
import { DashboardIcon, ProfileIcon, ManagementIcon, TransactionsIcon, GoalsIcon } from './icons';

interface BottomNavProps {
  activeView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, Icon, isActive, onClick }) => (
  <button 
    onClick={onClick} 
    className={`
      relative flex flex-col items-center justify-center 
      w-20 h-16 rounded-xl 
      transition-all duration-300 ease-in-out transform 
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-[var(--primary-400)]
      ${isActive 
        ? 'bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] -translate-y-3 scale-110 shadow-lg' 
        : 'bg-transparent'
      }
    `}
    aria-label={label}
  >
    <Icon className={`w-7 h-7 transition-all duration-300 ${isActive ? '-translate-y-1 text-white' : 'translate-y-0 text-gray-400'}`} />
    <span 
      className={`
        absolute bottom-2.5 text-xs font-bold text-white whitespace-nowrap
        transition-opacity duration-300 
        ${isActive ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {label}
    </span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView }) => {
  const navItems = [
    { view: View.DASHBOARD, label: "Dashboard", Icon: DashboardIcon },
    { view: View.TRANSACTIONS, label: "Transaksi", Icon: TransactionsIcon },
    { view: View.REPORT, label: "Manajemen", Icon: ManagementIcon },
    { view: View.MANAGEMENT, label: "Goals", Icon: GoalsIcon },
    { view: View.PROFILE, label: "Profil", Icon: ProfileIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-gray-900 flex items-start pt-2 z-40 border-t border-white/10">
      <div className="w-full flex">
        {navItems.map(item => (
          <div key={item.view} className="w-1/5 flex justify-center">
            <NavItem
              label={item.label}
              Icon={item.Icon}
              isActive={activeView === item.view}
              onClick={() => setView(item.view)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;