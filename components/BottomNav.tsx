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
    [View.REPORTS_DASHBOARD]: View.DASHBOARD,
    [View.ADD_TARGET]: View.DASHBOARD,
    [View.TARGET_HISTORY]: View.DASHBOARD,
    [View.ACTUALS_HISTORY]: View.DASHBOARD,
    [View.ADD_ACTUAL]: View.DASHBOARD,
  };
  
  const currentActiveView = activeViewsMap[activeView as keyof typeof activeViewsMap] || activeView;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-sm">
      <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl flex items-end justify-around p-2 rounded-2xl shadow-2xl border border-[var(--border-primary)]">
        {navItems.map((item) => {
          const isActive = currentActiveView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`relative flex flex-col items-center justify-center w-20 h-16 transition-all duration-500 ease-in-out rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-glow)] group
                ${isActive ? '' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive)]'}`
              }
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Elevating Container */}
              <div className={`flex flex-col items-center justify-center transition-transform duration-500 ease-in-out ${isActive ? '-translate-y-4' : ''}`}>
                {/* Icon Background */}
                <div
                  className={`flex items-center justify-center mx-auto transition-all duration-300 ease-in-out
                    ${isActive ? 'w-14 h-14 rounded-full shadow-lg' : 'w-auto h-auto'}`
                  }
                  style={isActive ? { backgroundImage: 'var(--gradient-active-nav)' } : {}}
                >
                  <item.Icon
                    className={`transition-all duration-300
                      ${isActive ? 'w-7 h-7 text-white' : 'w-6 h-6 text-inherit mb-1'}`
                    }
                  />
                </div>

                {/* The label */}
                <span
                  className={`text-xs font-semibold transition-all duration-300
                    ${isActive ? 'mt-3 text-[var(--text-primary)]' : 'text-inherit'}`
                  }
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;