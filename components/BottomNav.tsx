import React from 'react';
import { View } from '../types';
import { DashboardIcon, TransactionsIcon, GoalsIcon, WalletIcon } from './icons';

interface BottomNavProps {
  activeView: View;
  setView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView }) => {
  const navItems = [
    { view: View.DASHBOARD, label: "Dashboard", Icon: DashboardIcon },
    { view: View.TRANSACTIONS, label: "Transaksi", Icon: TransactionsIcon },
    { view: View.WALLET, label: "Dompet", Icon: WalletIcon },
    { view: View.MANAGEMENT, label: "Goals", Icon: GoalsIcon },
  ];

  const activeViewsMap: { [key in View]?: View } = {
    [View.DEBT_DETAIL]: View.MANAGEMENT,
    [View.SAVINGS_GOAL_DETAIL]: View.MANAGEMENT,
    [View.DEBT_HISTORY]: View.MANAGEMENT,
    [View.SAVINGS_GOAL_HISTORY]: View.MANAGEMENT,
  };
  
  const currentActiveView = activeViewsMap[activeView as keyof typeof activeViewsMap] || activeView;
  const activeIndex = navItems.findIndex(item => item.view === currentActiveView);

  return (
    // The container is made taller to accommodate the pop-out effect
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-[var(--bg-secondary-translucent)] backdrop-blur-xl flex z-50 border-t border-[var(--border-primary)]">
      {navItems.map((item, index) => {
        const isActive = activeIndex === index;
        return (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className="relative z-10 flex flex-1 flex-col items-center justify-start h-full pt-3 text-center transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-[var(--primary-400)] group"
            aria-label={item.label}
          >
            {/* This is the animated element that pops out */}
            <div
              className={`flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.25,1.5,0.5,1)] ${
                isActive
                  ? 'w-16 h-16 rounded-2xl -translate-y-8 shadow-lg shadow-[var(--primary-glow)]/30'
                  : 'w-12 h-12'
              }`}
              style={isActive ? { backgroundImage: 'var(--gradient-active-nav)' } : {}}
            >
              <item.Icon
                className={`transition-all duration-300 ${
                  isActive ? 'w-8 h-8 text-white' : `w-7 h-7 text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]`
                }`}
              />
            </div>
             {/* The label fades in at the bottom of the bar */}
            <span
                className={`absolute bottom-2 text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? 'opacity-100 text-[var(--text-primary)] font-bold'
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;