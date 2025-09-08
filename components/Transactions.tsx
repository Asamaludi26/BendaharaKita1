import React, { useState, useMemo } from 'react';
import type { Transaction, UserCategory, Account } from '../types';
import { TransactionType } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
  userCategories: UserCategory[];
  accounts: Account[];
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<{ transaction: Transaction; style: React.CSSProperties, onEdit: (transaction: Transaction) => void, accountName: string | undefined }> = ({ transaction, style, onEdit, accountName }) => {
  const isIncome = transaction.type === TransactionType.INCOME;
  const itemClasses = `
    relative p-4 bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)]
    rounded-xl shadow-md overflow-hidden group cursor-pointer
    transition-all duration-300 hover:border-[var(--border-secondary)] hover:bg-[var(--bg-interactive-hover)] hover:-translate-y-1
  `;
  const indicatorColor = isIncome ? 'var(--color-income)' : 'var(--color-expense)';

  return (
    <div className={itemClasses} style={style} onClick={() => onEdit(transaction)} role="button" tabIndex={0}>
      <div 
        className="absolute top-0 left-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5"
        style={{ backgroundColor: indicatorColor, boxShadow: `0 0 15px 2px ${indicatorColor}` }}
      ></div>
      <div className="flex items-center pl-4">
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-4">
              <i className={`fa-solid ${isIncome ? 'fa-arrow-down' : 'fa-arrow-up'} text-xl`} style={{color: indicatorColor}}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[var(--text-primary)] truncate">{transaction.description}</p>
          <p className="text-sm text-[var(--text-tertiary)]">{transaction.category} &bull; {accountName || 'N/A'}</p>
        </div>
        <div className="text-right ml-2">
          <p className={`font-bold text-lg whitespace-nowrap`} style={{color: indicatorColor}}>
            {isIncome ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-[var(--text-tertiary)]">
            {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>
    </div>
  );
};


const Transactions: React.FC<TransactionsProps> = ({ transactions, userCategories, accounts, onAdd, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { incomeCategories, expenseCategories } = useMemo(() => ({
      incomeCategories: userCategories.filter(c => c.type === TransactionType.INCOME),
      expenseCategories: userCategories.filter(c => c.type === TransactionType.EXPENSE),
  }), [userCategories]);

  const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc.name])), [accounts]);

  const groupedAndFilteredTransactions = useMemo(() => {
    const filtered = transactions
      .filter(t => {
          const searchMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
          const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
          return searchMatch && categoryMatch;
      });

    const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, tx) => {
      const date = new Date(tx.date);
      const monthYear = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(tx);
      return acc;
    }, {});
    
    return grouped;
  }, [transactions, searchTerm, selectedCategory]);
  

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in relative">
      <h1 className="text-3xl font-bold text-[var(--text-primary)]">Riwayat Transaksi</h1>
      
      <div className="sticky top-0 z-20 py-3 bg-[var(--bg-primary)]/80 backdrop-blur-lg -mx-4 md:-mx-6 px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"></i>
                <input 
                    type="text"
                    placeholder="Cari deskripsi transaksi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] backdrop-blur-sm border border-[var(--border-primary)] rounded-full focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent transition-all"
                />
            </div>
             <div className="relative flex-shrink-0">
                <i className="fa-solid fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"></i>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full md:w-auto appearance-none pl-10 pr-8 py-3 bg-[var(--bg-secondary)] backdrop-blur-sm border border-[var(--border-primary)] rounded-full focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent transition-all"
                >
                    <option value="all">Semua Kategori</option>
                    <optgroup label="Pemasukan">
                        {incomeCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </optgroup>
                    <optgroup label="Pengeluaran">
                        {expenseCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </optgroup>
                </select>
             </div>
          </div>
      </div>


      <div className="space-y-6 pb-24">
        {Object.keys(groupedAndFilteredTransactions).length > 0 ? (
          Object.entries(groupedAndFilteredTransactions).map(([monthYear, txs]) => (
            <div key={monthYear} className="animate-fade-in-up">
              <h2 className="text-lg font-bold text-[var(--text-secondary)] py-2 mb-3 border-b-2 border-[var(--border-primary)] sticky top-[84px] bg-[var(--bg-primary)]/80 backdrop-blur-xl z-10">{monthYear}</h2>
              <div className="space-y-3 stagger-children">
                {txs.map((tx, index) => <TransactionItem key={tx.id} transaction={tx} style={{ animationDelay: `${index * 50}ms` }} onEdit={onEdit} accountName={accountMap.get(tx.accountId)} />)}
              </div>
            </div>
          ))
        ) : (
            <div className="text-center p-8 mt-4 bg-[var(--bg-secondary)] backdrop-blur-lg rounded-2xl border border-[var(--border-primary)]">
                <i className="fa-solid fa-folder-open text-4xl text-[var(--text-tertiary)] mb-4"></i>
                <p className="font-semibold text-[var(--text-primary)]">Tidak Ada Transaksi</p>
                <p className="text-sm text-[var(--text-tertiary)]">Tidak ada transaksi yang cocok dengan filter Anda.</p>
            </div>
        )}
      </div>

      <button
        onClick={onAdd}
        className="fixed bottom-28 right-6 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[var(--primary-glow)]/30 transform hover:scale-110 transition-all z-40"
        style={{ backgroundImage: 'var(--gradient-active-nav)' }}
        aria-label="Tambah Transaksi Baru"
      >
        <i className="fa-solid fa-plus text-2xl"></i>
      </button>
    </div>
  );
};

export default Transactions;