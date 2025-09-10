import React, { useMemo, useState, useEffect } from 'react';
import { View, SavingsGoal, Account } from '../../types';
import Modal from '../Modal';

interface SavingsGoalDetailProps {
  goal: SavingsGoal;
  setView: (view: View) => void;
  onAddContribution: (goalId: string, amount: number, accountId: string) => void;
  accounts: Account[];
}

const StatCard: React.FC<{ icon: string; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-xl p-4 flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl`} style={{backgroundColor: color, boxShadow: `0 0 15px ${color}`}}>
            <i className={`fa-solid ${icon}`}></i>
        </div>
        <div>
            <p className="text-sm text-[var(--text-tertiary)]">{label}</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{value}</p>
        </div>
    </div>
);

const RadialProgress: React.FC<{ percentage: number; isEmergencyFund?: boolean }> = ({ percentage, isEmergencyFund }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setProgress(percentage), 100);
        return () => clearTimeout(timer);
    }, [percentage]);

    const viewBoxSize = 200;
    const strokeWidth = 12;
    const center = viewBoxSize / 2;
    const radius = center - (strokeWidth / 2);
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    const gradientId = isEmergencyFund ? 'progressGradientEmergency' : 'progressGradient';
    const gradientUrl = `url(#${gradientId})`;

    return (
        <div className="relative w-44 h-44 sm:w-52 sm:h-52">
            <svg
                height="100%"
                width="100%"
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                className="transform -rotate-90"
            >
                <circle
                    stroke="var(--bg-interactive)"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={center}
                    cy={center}
                />
                <circle
                    stroke={gradientUrl}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s ease-out' }}
                    r={radius}
                    cx={center}
                    cy={center}
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-net-positive)" />
                        <stop offset="100%" stopColor="var(--color-savings)" />
                    </linearGradient>
                     <linearGradient id="progressGradientEmergency" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#67e8f9" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-[var(--text-primary)] drop-shadow-lg">{Math.round(progress)}%</span>
            </div>
        </div>
    );
};


const SavingsGoalDetail: React.FC<SavingsGoalDetailProps> = ({ goal, setView, onAddContribution, accounts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');

  const {
      progress,
      remainingAmount,
      daysRemaining,
      dailyTarget,
      isAchieved
  } = useMemo(() => {
      const isAchieved = goal.currentAmount >= goal.targetAmount;
      const progress = isAchieved ? 100 : (goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0);
      const remainingAmount = isAchieved ? 0 : goal.targetAmount - goal.currentAmount;

      const now = new Date();
      now.setHours(0,0,0,0);
      const deadline = new Date(goal.deadline);
      deadline.setHours(0,0,0,0);
      
      const timeDiff = deadline.getTime() - now.getTime();
      const daysRemaining = timeDiff > 0 ? Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) : 0;
      const dailyTarget = daysRemaining > 0 && !isAchieved ? remainingAmount / daysRemaining : 0;
      
      return { progress, remainingAmount, daysRemaining, dailyTarget, isAchieved };
  }, [goal]);

  const handleSaveContribution = () => {
    const amount = parseInt(contributionAmount);
    if (amount > 0 && selectedAccountId) {
        onAddContribution(goal.id, amount, selectedAccountId);
        setContributionAmount('');
        setIsModalOpen(false);
    }
  };

  const sortedContributions = useMemo(() => {
      return [...(goal.contributions || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [goal.contributions]);
  
  const selectedAccountBalance = useMemo(() => {
    return accounts.find(a => a.id === selectedAccountId)?.balance ?? 0;
  }, [accounts, selectedAccountId]);

  const isContributionInvalid = !contributionAmount || parseInt(contributionAmount) <= 0 || !selectedAccountId || selectedAccountBalance < parseInt(contributionAmount);

  const mainButtonText = () => {
      if (isAchieved) {
          return goal.isEmergencyFund ? 'Tambah Dana Siaga' : 'Tujuan Tercapai';
      }
      return 'Tambah Dana';
  };
  
  const mainButtonIcon = isAchieved && !goal.isEmergencyFund ? 'fa-trophy' : 'fa-plus';

  const mainButtonDisabled = isAchieved && !goal.isEmergencyFund;


  return (
    <>
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <header className="flex items-center space-x-4">
                <button onClick={() => setView(View.MANAGEMENT)} className="w-10 h-10 rounded-full bg-[var(--bg-interactive)] text-[var(--text-tertiary)] flex items-center justify-center transition-colors shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)]">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="flex items-center space-x-3">
                    {goal.isEmergencyFund && <i className="fa-solid fa-shield-halved text-sky-400 text-2xl"></i>}
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{goal.name}</h1>
                        <p className="text-sm text-[var(--text-tertiary)]">{goal.source}</p>
                    </div>
                </div>
            </header>

            <div className="bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-2xl p-6 flex flex-col items-center">
                <RadialProgress percentage={progress} isEmergencyFund={goal.isEmergencyFund} />
                <div className="text-center mt-4">
                    <p className="text-[var(--text-tertiary)]">{isAchieved ? (goal.isEmergencyFund ? 'Dana Siaga' : 'Tercapai') : 'Terkumpul'}</p>
                    <p className="text-3xl font-bold" style={{color: 'var(--color-income)', filter: 'drop-shadow(0 0 8px var(--color-income))'}}>
                        Rp {goal.currentAmount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-[var(--text-tertiary)]">dari Rp {goal.targetAmount.toLocaleString('id-ID')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon="fa-hourglass-half" label={goal.isEmergencyFund ? 'Target Waktu' : 'Sisa Waktu'} value={`${daysRemaining} hari`} color="var(--primary-glow)" />
                <StatCard icon="fa-coins" label="Sisa Kebutuhan" value={`Rp ${remainingAmount.toLocaleString('id-ID')}`} color="var(--color-debt)" />
                <StatCard icon="fa-calendar-day" label="Target Harian" value={`Rp ${Math.ceil(dailyTarget).toLocaleString('id-ID')}`} color="var(--secondary-glow)" />
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                disabled={mainButtonDisabled}
                className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl hover:shadow-[var(--primary-glow)]/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                <i className={`fa-solid ${mainButtonIcon} mr-2`}></i> {mainButtonText()}
            </button>

            <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Riwayat Kontribusi</h3>
                <div className="bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-2xl p-4 max-h-60 overflow-y-auto">
                    {sortedContributions.length > 0 ? (
                        <ul className="space-y-3">
                            {sortedContributions.map((c, i) => {
                                const isWithdrawal = c.amount < 0;
                                const title = isWithdrawal ? 'Tarik Dana' : 'Setor Dana';
                                const amountText = `${isWithdrawal ? '-' : '+'}Rp ${Math.abs(c.amount).toLocaleString('id-ID')}`;
                                const amountColor = isWithdrawal ? 'var(--color-expense)' : 'var(--color-income)';
                                return (
                                    <li key={i} className="flex justify-between items-center bg-[var(--bg-interactive)] p-3 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-[var(--text-secondary)]">{title}</p>
                                            <p className="text-xs text-[var(--text-tertiary)]">{new Date(c.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <p className="font-bold" style={{color: amountColor}}>{amountText}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-center text-[var(--text-tertiary)] py-8">Belum ada kontribusi.</p>
                    )}
                </div>
            </div>

        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="relative bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-xl p-6 space-y-4">
                 <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Tambah Dana ke "{goal.name}"</h3>
                 <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Ambil Dari Akun</label>
                    <div className="relative group">
                        <select
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="w-full appearance-none p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent hover:border-[var(--border-secondary)] hover:bg-[var(--bg-interactive)] pr-10"
                        >
                            {accounts.length > 0 ? accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} (Saldo: Rp {acc.balance.toLocaleString('id-ID')})</option>
                            )) : <option disabled>Tidak ada akun</option>}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-tertiary)]">
                            <i className="fa-solid fa-chevron-down text-xs transition-transform duration-300 group-focus-within:rotate-180"></i>
                        </div>
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Jumlah Dana</label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">Rp</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={contributionAmount ? parseInt(contributionAmount).toLocaleString('id-ID') : ''}
                            onChange={(e) => setContributionAmount(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full p-3 pl-9 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent text-right text-[var(--text-primary)]"
                            autoFocus
                        />
                    </div>
                 </div>
                 <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="w-full bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)] transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveContribution}
                        disabled={isContributionInvalid}
                        className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Simpan
                    </button>
                 </div>
            </div>
        </Modal>
    </>
  );
};

export default SavingsGoalDetail;