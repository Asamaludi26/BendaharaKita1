import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
// FIX: Separated TransactionType import as it is used as a value, not just a type.
import type { Account, Transaction, DebtItem, SavingsGoal } from '../../types';
import { TransactionType } from '../../types';
import Modal from '../Modal';

interface AccountsProps {
    accounts: Account[];
    onAddAccount: () => void;
    onEditAccount: (account: Account) => void;
    onDeleteAccount: (accountId: string) => void;
    onTransfer: () => void;
    onReset: () => void;
    onSelectAccount: (accountId: string) => void;
    onInitiateTopUp: () => void;
    onInitiateWithdrawSavings: () => void;
    onAddExpense: () => void;
    transactions: Transaction[];
    displayDate: Date;
    activeDebts: DebtItem[];
    activeSavingsGoals: SavingsGoal[];
}

const AccountCarouselCard: React.FC<{ account: Account; onSelect: () => void }> = ({ account, onSelect }) => {
    const isNegative = account.balance < 0;

    const backgroundStyle = isNegative
        ? 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)'
        : account.type === 'Bank'
        ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
        : 'linear-gradient(135deg, #166534 0%, #22c55e 100%)';

    const icon = isNegative ? 'fa-triangle-exclamation' : account.type === 'Bank' ? 'fa-building-columns' : 'fa-wallet';

    return (
        <div
            onClick={onSelect}
            className="w-full h-48 rounded-2xl p-5 flex flex-col justify-between text-white shadow-lg cursor-pointer transform hover:scale-[1.03] transition-transform duration-300"
            style={{ background: backgroundStyle }}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><i className={`fa-solid ${icon}`}></i></div>
                    <span className="font-bold">{account.name}</span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider">{account.type}</span>
            </div>
            <div>
                <p className="text-sm opacity-80">Saldo</p>
                <p className="text-2xl font-bold tracking-tight">Rp {account.balance.toLocaleString('id-ID')}</p>
            </div>
        </div>
    );
};

const AccountListItem: React.FC<{ account: Account; onSelect: () => void; onEdit: () => void; onDelete: () => void }> = ({ account, onSelect, onEdit, onDelete }) => {
    const isNegative = account.balance < 0;
    const icon = isNegative ? 'fa-triangle-exclamation' : account.type === 'Bank' ? 'fa-building-columns' : 'fa-wallet';
    const iconColor = isNegative ? 'var(--color-warning)' : account.type === 'Bank' ? 'var(--primary-glow)' : 'var(--secondary-glow)';

    return (
        <div onClick={onSelect} className="relative rounded-xl p-px bg-gradient-to-b from-white/5 to-transparent group cursor-pointer transition-all duration-300 hover:from-white/10">
            <div className="relative p-3 bg-[var(--bg-secondary)] rounded-[11px] flex items-center space-x-4 hover:bg-[var(--bg-interactive-hover)]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0" style={{ borderColor: iconColor, backgroundColor: `${iconColor}1A`, color: iconColor }}>
                    <i className={`fa-solid ${icon} text-xl`}></i>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--text-primary)] truncate">{account.name}</p>
                    <p className={`font-semibold text-sm ${isNegative ? 'text-[var(--color-warning)]' : 'text-[var(--text-secondary)]'}`}>Rp {account.balance.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--primary-glow)] transition-colors"><i className="fa-solid fa-pencil"></i></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--color-expense)] transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        </div>
    );
};


const ActionButton: React.FC<{ label: string; icon: string; onClick: () => void; }> = ({ label, icon, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center space-y-2 p-2 rounded-lg hover:bg-[var(--bg-interactive-hover)] transition-colors w-full">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-interactive)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--primary-glow)]">
            <i className={`fa-solid ${icon}`}></i>
        </div>
        <span className="text-xs font-semibold text-center text-[var(--text-tertiary)]">{label}</span>
    </button>
);

const CategoryBreakdownItem: React.FC<{ name: string; amount: number; percentage: number; color: string }> = ({ name, amount, percentage, color }) => (
    <div className="space-y-1.5">
        <div className="flex justify-between items-center text-sm">
            <p className="font-semibold text-[var(--text-secondary)] truncate">{name}</p>
            <p className="font-bold text-[var(--text-primary)]">Rp {amount.toLocaleString('id-ID')}</p>
        </div>
        <div className="w-full bg-[var(--bg-interactive)] rounded-full h-2.5">
            <div className="h-2.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
        </div>
    </div>
);

const Accounts: React.FC<AccountsProps> = ({ accounts, onAddAccount, onEditAccount, onDeleteAccount, onTransfer, onReset, onSelectAccount, onInitiateTopUp, onInitiateWithdrawSavings, onAddExpense, transactions, displayDate, activeDebts, activeSavingsGoals }) => {
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
    const [isListView, setIsListView] = useState(false);
    
    const carouselRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const velocity = useRef(0);
    const animationFrame = useRef<number | null>(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        cardRefs.current = cardRefs.current.slice(0, accounts.length);
    }, [accounts]);

    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = cardRefs.current.indexOf(entry.target as HTMLDivElement);
                if (index !== -1) {
                    setActiveIndex(index);
                }
            }
        });
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(handleIntersection, {
            root: carouselRef.current,
            rootMargin: '0px',
            threshold: 0.6,
        });

        cardRefs.current.forEach(card => {
            if (card) observer.observe(card);
        });

        return () => {
            cardRefs.current.forEach(card => {
                if (card) observer.unobserve(card);
            });
        };
    }, [accounts, handleIntersection]);

    const momentumScroll = useCallback(() => {
        if (!carouselRef.current) return;
        
        carouselRef.current.scrollLeft += velocity.current;
        velocity.current *= 0.95; // Friction
        
        if (Math.abs(velocity.current) > 0.5) {
            animationFrame.current = requestAnimationFrame(momentumScroll);
        } else {
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        }
    }, []);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!carouselRef.current) return;
        isDragging.current = true;
        const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
        startX.current = pageX - carouselRef.current.offsetLeft;
        scrollLeft.current = carouselRef.current.scrollLeft;
        velocity.current = 0;
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
        }
        carouselRef.current.style.cursor = 'grabbing';
    };

    const handleDragEnd = () => {
        if (!carouselRef.current) return;
        isDragging.current = false;
        carouselRef.current.style.cursor = 'grab';
        if (Math.abs(velocity.current) > 1) {
             animationFrame.current = requestAnimationFrame(momentumScroll);
        }
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging.current || !carouselRef.current) return;
        e.preventDefault();
        const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
        const x = pageX - carouselRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // Scroll faster
        const newScrollLeft = scrollLeft.current - walk;
        
        velocity.current = newScrollLeft - carouselRef.current.scrollLeft;
        carouselRef.current.scrollLeft = newScrollLeft;
    };
    
    const totalBalance = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);

    const handleConfirmDelete = () => {
        if (accountToDelete) {
            onDeleteAccount(accountToDelete.id);
            setAccountToDelete(null);
        }
    };

    const monthlyTransactions = useMemo(() => {
        const start = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
        const end = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0, 23, 59, 59, 999);
        return transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= start && txDate <= end;
        });
    }, [transactions, displayDate]);

    const categoryBreakdown = useMemo(() => {
        const debtCategoryNames = new Set(activeDebts.map(d => d.name));
        const savingsCategoryNames = new Set(activeSavingsGoals.map(sg => sg.name));

        const incomeSummary: { [key: string]: number } = {};
        const expenseSummary: { [key: string]: number } = {};
        const debtSummary: { [key: string]: number } = {};
        const savingsSummary: { [key: string]: number } = {};

        monthlyTransactions.forEach(tx => {
            if (tx.type === TransactionType.INCOME) {
                incomeSummary[tx.category] = (incomeSummary[tx.category] || 0) + tx.amount;
            } else {
                if (debtCategoryNames.has(tx.category)) {
                    debtSummary[tx.category] = (debtSummary[tx.category] || 0) + tx.amount;
                } else if (savingsCategoryNames.has(tx.category)) {
                    savingsSummary[tx.category] = (savingsSummary[tx.category] || 0) + tx.amount;
                } else {
                    expenseSummary[tx.category] = (expenseSummary[tx.category] || 0) + tx.amount;
                }
            }
        });

        const toSortedArray = (summary: { [key: string]: number }) =>
            Object.entries(summary)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

        const income = toSortedArray(incomeSummary);
        const expenses = toSortedArray(expenseSummary);
        const debts = toSortedArray(debtSummary);
        const savings = toSortedArray(savingsSummary);

        const totalIncome = income.reduce((sum, item) => sum + item.value, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.value, 0);
        const totalDebts = debts.reduce((sum, item) => sum + item.value, 0);
        const totalSavings = savings.reduce((sum, item) => sum + item.value, 0);

        return { income, expenses, debts, savings, totalIncome, totalExpenses, totalDebts, totalSavings };
    }, [monthlyTransactions, activeDebts, activeSavingsGoals]);


    return (
        <>
            {isListView && (
                <div onClick={() => setIsListView(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 animate-fade-in"></div>
            )}
            <div className="p-4 md:p-6 space-y-6 animate-fade-in pb-24">
                <header className="flex justify-between items-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Dompet & Akun</h1>
                    <button onClick={onReset} className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] text-[var(--text-tertiary)] flex items-center justify-center transition-colors shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)]" aria-label="Atur Ulang Data Dompet" title="Atur Ulang Data Dompet">
                        <i className="fa-solid fa-gear"></i>
                    </button>
                </header>

                <div className="relative p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-center shadow-lg">
                    <p className="text-sm font-medium text-[var(--text-tertiary)]">Total Saldo di Semua Akun</p>
                    <p className={`text-4xl font-bold mt-2 ${totalBalance < 0 ? 'text-[var(--color-expense)]' : 'text-[var(--text-primary)]'}`}>
                        Rp {totalBalance.toLocaleString('id-ID')}
                    </p>
                </div>
                
                {!isListView && (
                    <>
                        <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl">
                            <div className="grid grid-cols-4 gap-2">
                                <ActionButton label="Isi Saldo" icon="fa-circle-plus" onClick={onInitiateTopUp} />
                                <ActionButton label="Transfer" icon="fa-right-left" onClick={onTransfer} />
                                <ActionButton label="Tarik Tabungan" icon="fa-vault" onClick={onInitiateWithdrawSavings} />
                                <ActionButton label="Pengeluaran" icon="fa-cart-shopping" onClick={onAddExpense} />
                            </div>
                        </div>

                        <div className="relative rounded-2xl p-px bg-gradient-to-b from-white/10 to-transparent">
                            <div className="bg-[var(--bg-secondary)] rounded-[15px] p-6 space-y-6">
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">Ringkasan Alokasi Bulan Ini</h2>
                                
                                {/* Income Section */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold text-[var(--color-income)] flex items-center gap-2"><i className="fa-solid fa-arrow-down"></i> Pemasukan</h3>
                                        <span className="text-sm font-bold text-[var(--text-primary)]">Rp {categoryBreakdown.totalIncome.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="space-y-4">
                                        {categoryBreakdown.income.length > 0 ? categoryBreakdown.income.map(item => (
                                            // FIX: Passed `amount` prop explicitly instead of spreading `item`.
                                            <CategoryBreakdownItem key={item.name} name={item.name} amount={item.value} percentage={(item.value / categoryBreakdown.totalIncome) * 100} color="var(--color-income)" />
                                        )) : <p className="text-xs text-center text-[var(--text-tertiary)] py-2">Belum ada pemasukan bulan ini.</p>}
                                    </div>
                                </div>
                                
                                 {/* Expenses Section */}
                                <div>
                                    <h3 className="font-semibold text-[var(--color-expense)] flex items-center gap-2 mb-3"><i className="fa-solid fa-arrow-up"></i> Pengeluaran</h3>
                                    <div className="space-y-6 p-4 bg-[var(--bg-interactive)] rounded-lg">
                                        {/* Debt Payments */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="font-semibold text-[var(--text-secondary)] text-sm flex items-center gap-2"><i className="fa-solid fa-file-invoice-dollar text-[var(--color-debt)]"></i> Pembayaran Utang</h4>
                                                <span className="text-sm font-bold text-[var(--text-primary)]">Rp {categoryBreakdown.totalDebts.toLocaleString('id-ID')}</span>
                                            </div>
                                            {categoryBreakdown.debts.length > 0 ? categoryBreakdown.debts.map(item => (
                                                // FIX: Passed `amount` prop explicitly instead of spreading `item`.
                                                <CategoryBreakdownItem key={item.name} name={item.name} amount={item.value} percentage={(item.value / (categoryBreakdown.totalDebts + categoryBreakdown.totalSavings + categoryBreakdown.totalExpenses)) * 100} color="var(--color-debt)" />
                                            )) : <p className="text-xs text-center text-[var(--text-tertiary)] py-2">Tidak ada pembayaran utang.</p>}
                                        </div>

                                        {/* Savings Contributions */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="font-semibold text-[var(--text-secondary)] text-sm flex items-center gap-2"><i className="fa-solid fa-piggy-bank text-[var(--color-savings)]"></i> Setoran Tabungan</h4>
                                                <span className="text-sm font-bold text-[var(--text-primary)]">Rp {categoryBreakdown.totalSavings.toLocaleString('id-ID')}</span>
                                            </div>
                                            {categoryBreakdown.savings.length > 0 ? categoryBreakdown.savings.map(item => (
                                                // FIX: Passed `amount` prop explicitly instead of spreading `item`.
                                                <CategoryBreakdownItem key={item.name} name={item.name} amount={item.value} percentage={(item.value / (categoryBreakdown.totalDebts + categoryBreakdown.totalSavings + categoryBreakdown.totalExpenses)) * 100} color="var(--color-savings)" />
                                            )) : <p className="text-xs text-center text-[var(--text-tertiary)] py-2">Tidak ada setoran tabungan.</p>}
                                        </div>

                                        {/* Other Expenses */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="font-semibold text-[var(--text-secondary)] text-sm flex items-center gap-2"><i className="fa-solid fa-receipt text-[var(--color-expense)]"></i> Pengeluaran Lainnya</h4>
                                                <span className="text-sm font-bold text-[var(--text-primary)]">Rp {categoryBreakdown.totalExpenses.toLocaleString('id-ID')}</span>
                                            </div>
                                            {categoryBreakdown.expenses.length > 0 ? categoryBreakdown.expenses.map(item => (
                                                // FIX: Passed `amount` prop explicitly instead of spreading `item`.
                                                <CategoryBreakdownItem key={item.name} name={item.name} amount={item.value} percentage={(item.value / (categoryBreakdown.totalDebts + categoryBreakdown.totalSavings + categoryBreakdown.totalExpenses)) * 100} color="var(--color-expense)" />
                                            )) : <p className="text-xs text-center text-[var(--text-tertiary)] py-2">Tidak ada pengeluaran lain.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">Daftar Akun</h2>
                         <div className="flex items-center space-x-2">
                            <button onClick={onAddAccount} className="flex items-center space-x-2 text-sm font-semibold text-[var(--primary-glow)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--bg-interactive-hover)]">
                                <i className="fa-solid fa-plus"></i>
                                <span className="hidden sm:inline">Tambah Akun</span>
                            </button>
                             <button onClick={() => setIsListView(!isListView)} className="flex items-center space-x-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--bg-interactive-hover)]">
                                <i className={`fa-solid ${isListView ? 'fa-layer-group' : 'fa-list'}`}></i>
                                <span className="hidden sm:inline">{isListView ? 'Ringkasan' : 'Lihat Semua'}</span>
                            </button>
                        </div>
                    </div>
                    {accounts.length > 0 ? (
                        <div className="relative">
                            <div
                                ref={carouselRef}
                                onMouseDown={handleDragStart}
                                onMouseUp={handleDragEnd}
                                onMouseLeave={handleDragEnd}
                                onMouseMove={handleDragMove}
                                onTouchStart={handleDragStart}
                                onTouchEnd={handleDragEnd}
                                onTouchMove={handleDragMove}
                                className="flex space-x-4 overflow-x-auto snap-x snap-mandatory p-2 -m-2 no-scrollbar cursor-grab"
                                style={{scrollBehavior: 'smooth'}}
                            >
                                {accounts.map((acc, index) => (
                                    <div 
                                        key={acc.id} 
                                        ref={el => { cardRefs.current[index] = el; }}
                                        className="w-4/5 sm:w-1/2 md:w-1/3 flex-shrink-0 snap-center"
                                    >
                                        <AccountCarouselCard account={acc} onSelect={() => onSelectAccount(acc.id)} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center space-x-2 mt-4">
                                {accounts.map((_, index) => (
                                    <div key={index} className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-[var(--primary-glow)] scale-125' : 'bg-[var(--bg-interactive)]'}`} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-[var(--bg-secondary)] rounded-2xl mt-4">
                            <i className="fa-solid fa-folder-open text-4xl text-[var(--text-tertiary)] mb-4"></i>
                            <p className="font-semibold text-[var(--text-primary)]">Belum Ada Akun</p>
                            <p className="text-sm text-[var(--text-tertiary)]">Klik 'Tambah Akun' untuk memulai.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* List View Overlay */}
             {isListView && (
                <div 
                    className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-secondary)]/80 backdrop-blur-xl border-t border-[var(--border-primary)] rounded-t-2xl shadow-2xl flex flex-col animate-fade-in-up"
                    style={{ maxHeight: '70vh', paddingBottom: 'calc(env(safe-area-inset-bottom, 0rem) + 8rem)' }}
                >
                    <div className="p-4 pt-3 flex-shrink-0">
                        <div className="w-12 h-1.5 bg-[var(--border-secondary)] rounded-full mx-auto mb-5"></div>
                        <h3 className="text-xl font-bold text-center text-[var(--text-primary)]">Semua Akun</h3>
                    </div>
                    <div className="overflow-y-auto px-4 flex-grow space-y-3">
                        {accounts.map(acc => (
                            <AccountListItem 
                                key={acc.id}
                                account={acc}
                                onSelect={() => { onSelectAccount(acc.id); setIsListView(false); }}
                                onEdit={() => { onEditAccount(acc); setIsListView(false); }}
                                onDelete={() => { setAccountToDelete(acc); setIsListView(false); }}
                            />
                        ))}
                    </div>
                </div>
             )}

            <Modal isOpen={!!accountToDelete} onClose={() => setAccountToDelete(null)}>
                <div className="relative bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-xl text-center p-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-600 shadow-lg shadow-red-500/40 mb-4">
                        <i className="fa-solid fa-triangle-exclamation text-3xl text-white"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Hapus Akun?</h3>
                    <p className="text-[var(--text-secondary)] mb-6">
                        Anda yakin ingin menghapus akun <strong>{accountToDelete?.name}</strong>? Tindakan ini tidak dapat diurungkan.
                        <br/><br/>
                        <span className="font-bold text-[var(--color-warning)]">Anda hanya bisa menghapus akun yang tidak memiliki riwayat transaksi.</span>
                    </p>
                    <div className="flex flex-col gap-3">
                        <button type="button" onClick={handleConfirmDelete} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-red-700">Ya, Hapus</button>
                        <button type="button" onClick={() => setAccountToDelete(null)} className="w-full bg-transparent text-[var(--text-tertiary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)]">Batal</button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Accounts;