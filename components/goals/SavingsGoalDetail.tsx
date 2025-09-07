import React, { useMemo, useState, useEffect } from 'react';
import { View, SavingsGoal } from '../../types';
import Modal from '../Modal';

interface SavingsGoalDetailProps {
  goal: SavingsGoal;
  setView: (view: View) => void;
  onAddContribution: (goalId: string, amount: number) => void;
}

const StatCard: React.FC<{ icon: string; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-black/20 border border-white/10 rounded-xl p-4 flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl`} style={{backgroundColor: color, boxShadow: `0 0 15px ${color}`}}>
            <i className={`fa-solid ${icon}`}></i>
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
        </div>
    </div>
);

const RadialProgress: React.FC<{ percentage: number }> = ({ percentage }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setProgress(percentage), 100);
        return () => clearTimeout(timer);
    }, [percentage]);

    // Corrected SVG Geometry for perfect centering
    const viewBoxSize = 200;
    const strokeWidth = 12;
    const center = viewBoxSize / 2;
    // Radius is center minus half the stroke width to prevent clipping
    const radius = center - (strokeWidth / 2);
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-52 h-52">
            <svg
                height="100%"
                width="100%"
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                className="transform -rotate-90"
            >
                <circle
                    stroke="rgba(255,255,255,0.1)"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={center}
                    cy={center}
                />
                <circle
                    stroke="url(#progressGradient)"
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
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white drop-shadow-lg">{Math.round(progress)}%</span>
            </div>
        </div>
    );
};


const SavingsGoalDetail: React.FC<SavingsGoalDetailProps> = ({ goal, setView, onAddContribution }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');

  const {
      progress,
      remainingAmount,
      daysRemaining,
      dailyTarget,
      monthlyTarget,
      isAchieved
  } = useMemo(() => {
      const isAchieved = goal.currentAmount >= goal.targetAmount;
      const progress = isAchieved ? 100 : (goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0);
      const remainingAmount = isAchieved ? 0 : goal.targetAmount - goal.currentAmount;

      const now = new Date();
      now.setHours(0,0,0,0);
      const deadline = new Date(goal.deadline);
      deadline.setHours(0,0,0,0);
      
      const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const dailyTarget = daysRemaining > 0 ? remainingAmount / daysRemaining : 0;
      
      const monthsRemaining = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
      const monthlyTarget = monthsRemaining > 0 ? remainingAmount / monthsRemaining : 0;

      return { progress, remainingAmount, daysRemaining, dailyTarget, monthlyTarget, isAchieved };
  }, [goal]);

  const handleSaveContribution = () => {
    const amount = parseInt(contributionAmount);
    if (amount > 0) {
        onAddContribution(goal.id, amount);
        setContributionAmount('');
        setIsModalOpen(false);
    }
  };

  const sortedContributions = useMemo(() => {
      return [...(goal.contributions || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [goal.contributions]);

  return (
    <>
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <header className="flex items-center space-x-4">
                <button onClick={() => setView(View.MANAGEMENT)} className="w-10 h-10 rounded-full bg-black/20 text-gray-300 flex items-center justify-center transition-colors shadow-sm hover:bg-white/10 border border-white/10">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">{goal.name}</h1>
                    <p className="text-sm text-gray-400">{goal.source}</p>
                </div>
            </header>

            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center">
                <RadialProgress percentage={progress} />
                <div className="text-center mt-4">
                    <p className="text-gray-400">Terkumpul</p>
                    <p className="text-3xl font-bold text-[var(--color-income)]" style={{filter: 'drop-shadow(0 0 8px var(--color-income))'}}>
                        Rp {goal.currentAmount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-500">dari Rp {goal.targetAmount.toLocaleString('id-ID')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon="fa-hourglass-half" label="Sisa Waktu" value={`${daysRemaining} hari`} color="var(--primary-glow)" />
                <StatCard icon="fa-coins" label="Sisa Kebutuhan" value={`Rp ${remainingAmount.toLocaleString('id-ID')}`} color="var(--color-debt)" />
                <StatCard icon="fa-calendar-day" label="Target Harian" value={`Rp ${Math.ceil(dailyTarget).toLocaleString('id-ID')}`} color="var(--secondary-glow)" />
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                disabled={isAchieved}
                className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl hover:shadow-[var(--primary-glow)]/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                {isAchieved ? (
                    <><i className="fa-solid fa-trophy mr-2"></i> Tujuan Tercapai</>
                ) : (
                    <><i className="fa-solid fa-plus mr-2"></i> Tambah Dana</>
                )}
            </button>

            <div>
                <h3 className="text-xl font-bold text-white mb-4">Riwayat Kontribusi</h3>
                <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-4 max-h-60 overflow-y-auto">
                    {sortedContributions.length > 0 ? (
                        <ul className="space-y-3">
                            {sortedContributions.map((c, i) => (
                                <li key={i} className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-300">Setoran Dana</p>
                                        <p className="text-xs text-gray-400">{new Date(c.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <p className="font-bold text-[var(--color-income)]">+Rp {c.amount.toLocaleString('id-ID')}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-400 py-8">Belum ada kontribusi.</p>
                    )}
                </div>
            </div>

        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="relative bg-gray-800/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6">
                 <h3 className="text-xl font-bold text-white mb-4">Tambah Dana ke "{goal.name}"</h3>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Jumlah Dana</label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">Rp</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={contributionAmount ? parseInt(contributionAmount).toLocaleString('id-ID') : ''}
                            onChange={(e) => setContributionAmount(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full p-3 pl-9 bg-black/20 border border-white/10 rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent text-right"
                            autoFocus
                        />
                    </div>
                 </div>
                 <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="w-full bg-black/30 border border-white/10 text-gray-300 font-semibold py-3 px-6 rounded-full hover:bg-black/50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveContribution}
                        disabled={!contributionAmount || parseInt(contributionAmount) <= 0}
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