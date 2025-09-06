import React, { useMemo } from 'react';
import { View, SavingsGoal } from '../../types';
import SavingsGoalItemCard from '../goals/SavingsGoalItemCard';

interface SavingsGoalHistoryProps {
    completedGoals: SavingsGoal[];
    setView: (view: View) => void;
    onSelectSavingsGoal: (id: string) => void;
}

const SavingsGoalHistory: React.FC<SavingsGoalHistoryProps> = ({ completedGoals, setView, onSelectSavingsGoal }) => {

    const groupedGoals = useMemo(() => {
        const grouped = completedGoals.reduce<Record<string, SavingsGoal[]>>((acc, goal) => {
            const deadline = new Date(goal.deadline);
            const sortableKey = `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}`;
            
            if (!acc[sortableKey]) {
                acc[sortableKey] = [];
            }
            acc[sortableKey].push(goal);
            return acc;
        }, {});
        
        const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
        
        const result: { monthYear: string; goals: SavingsGoal[] }[] = sortedKeys.map(key => {
            const [year, month] = key.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            const monthYear = `Tercapai pada ${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date)}`;
            return { monthYear, goals: grouped[key] };
        });

        return result;
    }, [completedGoals]);

    return (
        <div className="p-4 md:p-6 space-y-4 pb-24">
            <header className="flex items-center space-x-4">
                <button onClick={() => setView(View.MANAGEMENT)} className="text-gray-500 dark:text-gray-400">
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Riwayat Tujuan Tercapai</h1>
            </header>
            
            <div className="space-y-6">
                {groupedGoals.length > 0 ? (
                    groupedGoals.map(({ monthYear, goals }) => (
                        <div key={monthYear}>
                            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 py-2 mb-3 border-b-2 border-gray-200 dark:border-gray-700">{monthYear}</h2>
                            <div className="space-y-4">
                                {goals.map(goal => <SavingsGoalItemCard key={goal.id} goal={goal} onSelect={onSelectSavingsGoal} />)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 mt-4 bg-white dark:bg-gray-800 rounded-2xl">
                        <i className="fa-solid fa-box-open text-4xl text-gray-400 mb-4"></i>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">Riwayat Kosong</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada tujuan tabungan yang berhasil Anda capai.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavingsGoalHistory;
