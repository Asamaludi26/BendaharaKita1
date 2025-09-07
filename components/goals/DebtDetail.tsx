import React, { useMemo, useState, useEffect } from 'react';
import { View, DebtItem } from '../../types';
import Modal from '../Modal';

interface DebtDetailProps {
  debt: DebtItem;
  setView: (view: View) => void;
  onAddPayment: (debtId: string, amount: number) => void;
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

    const viewBoxSize = 200;
    const strokeWidth = 12;
    const center = viewBoxSize / 2;
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
                    stroke="url(#progressGradientDebt)"
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
                    <linearGradient id="progressGradientDebt" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-expense)" />
                        <stop offset="100%" stopColor="var(--color-debt)" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white drop-shadow-lg">{Math.round(progress)}%</span>
            </div>
        </div>
    );
};

const DebtDetail: React.FC<DebtDetailProps> = ({ debt, setView, onAddPayment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const {
      progress,
      paidAmount,
      remainingAmount,
      remainingTenor,
      isPaid,
  } = useMemo(() => {
      const paidAmount = debt.payments.reduce((sum, p) => sum + p.amount, 0);
      const remainingAmount = debt.totalAmount - paidAmount;
      const isPaid = remainingAmount <= 0;
      const progress = isPaid ? 100 : (debt.totalAmount > 0 ? Math.min((paidAmount / debt.totalAmount) * 100, 100) : 0);
      const remainingTenor = debt.tenor - debt.payments.length;
      
      return { progress, paidAmount, remainingAmount, remainingTenor, isPaid };
  }, [debt]);

  const handleSavePayment = () => {
    const amount = parseInt(paymentAmount);
    if (amount > 0) {
        onAddPayment(debt.id, amount);
        setPaymentAmount('');
        setIsModalOpen(false);
    }
  };

  const sortedPayments = useMemo(() => {
      return [...(debt.payments || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [debt.payments]);

  return (
    <>
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <header className="flex items-center space-x-4">
                <button onClick={() => setView(View.MANAGEMENT)} className="w-10 h-10 rounded-full bg-black/20 text-gray-300 flex items-center justify-center transition-colors shadow-sm hover:bg-white/10 border border-white/10">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">{debt.name}</h1>
                    <p className="text-sm text-gray-400">{debt.source}</p>
                </div>
            </header>

            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center">
                <RadialProgress percentage={progress} />
                <div className="text-center mt-4">
                    <p className="text-gray-400">Sisa Utang</p>
                    <p className="text-3xl font-bold text-[var(--color-expense)]" style={{filter: 'drop-shadow(0 0 8px var(--color-expense))'}}>
                        Rp {remainingAmount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-500">dari Rp {debt.totalAmount.toLocaleString('id-ID')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon="fa-hourglass-half" label="Sisa Tenor" value={`${remainingTenor} bulan`} color="var(--color-debt)" />
                <StatCard icon="fa-money-bill-wave" label="Cicilan /bln" value={`Rp ${debt.monthlyInstallment.toLocaleString('id-ID')}`} color="var(--color-expense)" />
                <StatCard icon="fa-calendar-day" label="Jatuh Tempo" value={`Tgl. ${debt.dueDate}`} color="var(--color-balance)" />
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                disabled={isPaid}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                <i className="fa-solid fa-plus mr-2"></i> {isPaid ? 'Utang Lunas' : 'Bayar Cicilan'}
            </button>

            <div>
                <h3 className="text-xl font-bold text-white mb-4">Riwayat Pembayaran</h3>
                <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-4 max-h-60 overflow-y-auto">
                    {sortedPayments.length > 0 ? (
                        <ul className="space-y-3">
                            {sortedPayments.map((p, i) => (
                                <li key={i} className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-300">Pembayaran Cicilan</p>
                                        <p className="text-xs text-gray-400">{new Date(p.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <p className="font-bold text-[var(--color-debt)]">-Rp {p.amount.toLocaleString('id-ID')}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-400 py-8">Belum ada pembayaran.</p>
                    )}
                </div>
            </div>

        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="relative bg-gray-800/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6">
                 <h3 className="text-xl font-bold text-white mb-4">Catat Pembayaran</h3>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Jumlah Pembayaran</label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">Rp</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder={debt.monthlyInstallment.toLocaleString('id-ID')}
                            value={paymentAmount ? parseInt(paymentAmount).toLocaleString('id-ID') : ''}
                            onChange={(e) => setPaymentAmount(e.target.value.replace(/[^0-9]/g, ''))}
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
                        onClick={handleSavePayment}
                        disabled={!paymentAmount || parseInt(paymentAmount) <= 0}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Simpan
                    </button>
                 </div>
            </div>
        </Modal>
    </>
  );
};

export default DebtDetail;