import React, { useMemo } from 'react';
import { View, DebtItem } from '../../types';
import DebtItemCard from '../goals/DebtItemCard';

interface DebtHistoryProps {
    paidDebts: DebtItem[];
    setView: (view: View) => void;
    onSelectDebt: (id: string) => void;
}

const DebtHistory: React.FC<DebtHistoryProps> = ({ paidDebts, setView, onSelectDebt }) => {

    const groupedDebts = useMemo(() => {
        const grouped = paidDebts.reduce<Record<string, DebtItem[]>>((acc, debt) => {
            if (debt.payments.length === 0) return acc;

            const lastPaymentDate = new Date(Math.max(...debt.payments.map(p => new Date(p.date).getTime())));
            
            const sortableKey = `${lastPaymentDate.getFullYear()}-${String(lastPaymentDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (!acc[sortableKey]) {
                acc[sortableKey] = [];
            }
            acc[sortableKey].push(debt);
            return acc;
        }, {});
        
        const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
        
        const result: { monthYear: string; debts: DebtItem[] }[] = sortedKeys.map(key => {
            const [year, month] = key.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            const monthYear = `Lunas pada ${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date)}`;
            return { monthYear, debts: grouped[key] };
        });

        return result;
    }, [paidDebts]);

    return (
        <div className="p-4 md:p-6 space-y-4 pb-24">
            <header className="flex items-center space-x-4">
                <button onClick={() => setView(View.MANAGEMENT)} className="text-gray-500 dark:text-gray-400">
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Riwayat Pinjaman Lunas</h1>
            </header>
            
            <div className="space-y-6">
                {groupedDebts.length > 0 ? (
                    groupedDebts.map(({ monthYear, debts }) => (
                        <div key={monthYear}>
                            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 py-2 mb-3 border-b-2 border-gray-200 dark:border-gray-700">{monthYear}</h2>
                            <div className="space-y-4">
                                {debts.map(debt => <DebtItemCard key={debt.id} debt={debt} onSelect={onSelectDebt} />)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 mt-4 bg-white dark:bg-gray-800 rounded-2xl">
                        <i className="fa-solid fa-box-open text-4xl text-gray-400 mb-4"></i>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">Riwayat Kosong</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada pinjaman yang berhasil Anda lunasi.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DebtHistory;