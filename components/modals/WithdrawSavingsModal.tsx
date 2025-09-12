import React, { useState, useMemo } from 'react';
import type { Account, SavingsGoal } from '../../types';
import Modal from '../Modal';

interface WithdrawSavingsModalProps {
    savingsGoals: SavingsGoal[];
    accounts: Account[];
    onWithdraw: (goalId: string, accountId: string, amount: number) => void;
    onClose: () => void;
}

// A helper function to render highlighted text
const renderContentWithHighlight = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={index} className="font-bold text-[var(--primary-glow)]">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });
};

const WithdrawSavingsModal: React.FC<WithdrawSavingsModalProps> = ({ savingsGoals, accounts, onWithdraw, onClose }) => {
    const [selectedGoalId, setSelectedGoalId] = useState(savingsGoals.length > 0 ? savingsGoals[0].id : '');
    const [selectedAccountId, setSelectedAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');
    const [amount, setAmount] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const selectedGoal = useMemo(() => savingsGoals.find(g => g.id === selectedGoalId), [savingsGoals, selectedGoalId]);
    const isEmergencyWithdrawal = selectedGoal?.isEmergencyFund === true;

    const isFormValid = useMemo(() => {
        const numericAmount = parseInt(amount || '0');
        if (!selectedGoalId || !selectedAccountId || numericAmount <= 0) {
            return false;
        }
        return numericAmount <= (selectedGoal?.currentAmount || 0);
    }, [selectedGoalId, selectedAccountId, amount, selectedGoal]);

    const handleAttemptWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            setShowConfirm(true);
        }
    };
    
    const handleConfirmWithdraw = () => {
        onWithdraw(selectedGoalId, selectedAccountId, parseInt(amount));
        setShowConfirm(false);
    };
    
    const labelClasses = "block text-sm font-medium text-[var(--text-secondary)] mb-1";
    const selectClasses = "w-full appearance-none p-3 pr-10 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-interactive)] focus:ring-2 focus:ring-[var(--primary-glow)]";

    const modalTitle = isEmergencyWithdrawal ? "Gunakan Dana Darurat" : "Ambil Dana Tabungan";
    const modalDescription = isEmergencyWithdrawal ? "Gunakan hanya untuk kebutuhan mendesak." : "Pindahkan dana dari tujuan ke dompet.";
    const modalIcon = isEmergencyWithdrawal ? "fa-shield-halved" : "fa-vault";

    const confirmationTitle = isEmergencyWithdrawal ? "Gunakan Dana Darurat?" : "Anda Yakin?";
    const confirmationIcon = isEmergencyWithdrawal ? "fa-triangle-exclamation" : "fa-circle-question";
    const confirmationButtonClass = isEmergencyWithdrawal ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700";
    const confirmationMessage = isEmergencyWithdrawal
        ? `Dana darurat sebaiknya hanya digunakan untuk situasi tak terduga. Tindakan ini akan **mengurangi dana siaga** Anda.`
        : `Menarik dana sebesar **Rp ${(parseInt(amount) || 0).toLocaleString('id-ID')}** akan **mengurangi progres** tabungan Anda dan dicatat dalam riwayat.`;


    return (
        <>
            <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
                <header className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                         <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border-primary)] text-[var(--text-secondary)] bg-[var(--bg-interactive)] flex-shrink-0">
                            <i className={`fa-solid ${modalIcon} text-2xl`}></i>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[var(--text-primary)]">{modalTitle}</h1>
                            <p className="text-sm text-[var(--text-tertiary)]">{modalDescription}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-times text-lg"></i>
                    </button>
                </header>

                <form onSubmit={handleAttemptWithdraw} className="space-y-4">
                    <div>
                        <label className={labelClasses}>Ambil Dari Tujuan</label>
                        <div className="relative group">
                            <select value={selectedGoalId} onChange={e => setSelectedGoalId(e.target.value)} className={selectClasses}>
                                {savingsGoals.length > 0 ? savingsGoals.map(goal => <option key={goal.id} value={goal.id}>{goal.name} (Tersedia: Rp {goal.currentAmount.toLocaleString('id-ID')})</option>) : <option disabled>Tidak ada tujuan tabungan aktif</option>}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-tertiary)]"><i className="fa-solid fa-chevron-down text-xs"></i></div>
                        </div>
                    </div>
                     <div>
                        <label className={labelClasses}>Masukkan Ke Akun</label>
                        <div className="relative group">
                            <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className={selectClasses}>
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Saldo: Rp {acc.balance.toLocaleString('id-ID')})</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-tertiary)]"><i className="fa-solid fa-chevron-down text-xs"></i></div>
                        </div>
                    </div>
                     <div>
                        <label className={labelClasses}>Jumlah Penarikan</label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">Rp</span>
                            <input type="text" inputMode="numeric" value={amount ? parseInt(amount).toLocaleString('id-ID') : ''} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))} className="w-full p-3 pl-8 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] text-right" placeholder="0" />
                        </div>
                        {selectedGoal && parseInt(amount) > selectedGoal.currentAmount && (
                            <p className="text-xs text-[var(--color-expense)] mt-1">Jumlah melebihi saldo tabungan yang tersedia.</p>
                        )}
                    </div>
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-transparent text-[var(--text-secondary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)]">Batal</button>
                        <button type="submit" disabled={!isFormValid} className="bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg disabled:opacity-50">Ambil Dana</button>
                    </div>
                </form>
            </div>

            <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
                <div className="relative bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-xl text-center p-6">
                    <button onClick={() => setShowConfirm(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)]"><i className="fa-solid fa-times text-xl"></i></button>
                    
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-500/40 mb-4">
                        <i className={`fa-solid ${confirmationIcon} text-3xl text-white`}></i>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{confirmationTitle}</h3>
                    <p className="text-[var(--text-secondary)] mb-6">
                         {renderContentWithHighlight(confirmationMessage)}
                    </p>
                    <div className="flex flex-col gap-3">
                        <button type="button" onClick={handleConfirmWithdraw} className={`w-full text-white font-bold py-3 px-6 rounded-full shadow-lg ${confirmationButtonClass}`}>Ya, Lanjutkan</button>
                        <button type="button" onClick={() => setShowConfirm(false)} className="w-full bg-transparent text-[var(--text-tertiary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)]">Batal</button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default WithdrawSavingsModal;