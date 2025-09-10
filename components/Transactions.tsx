import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { Transaction, UserCategory, Account } from '../../types';
import { TransactionType } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
  userCategories: UserCategory[];
  accounts: Account[];
  onAdd: () => void;
  onSelect: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<{ transaction: Transaction; style: React.CSSProperties, onSelect: (transaction: Transaction) => void, accountName: string | undefined }> = ({ transaction, style, onSelect, accountName }) => {
  const isIncome = transaction.type === TransactionType.INCOME;
  const indicatorColor = isIncome ? 'var(--color-income)' : 'var(--color-expense)';

  return (
    <div 
        className="relative rounded-xl p-px bg-gradient-to-b from-white/5 to-transparent group cursor-pointer transition-all duration-300 hover:from-white/10"
        style={style} 
        onClick={() => onSelect(transaction)} 
        role="button" 
        tabIndex={0} 
        aria-label={`Lihat detail transaksi: ${transaction.description}`}
    >
      <div className="relative p-4 bg-[var(--bg-secondary)] rounded-[11px] overflow-hidden">
        <div 
          className="absolute top-0 left-0 bottom-0 w-1.5 transition-all duration-300"
          style={{ backgroundColor: indicatorColor }}
        ></div>
        <div className="flex items-center pl-4">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base text-[var(--text-primary)] truncate">{transaction.description}</p>
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
    </div>
  );
};

const FilterChip: React.FC<{ label: string; value: string; selectedValue: string; onSelect: (value: string) => void; }> = ({ label, value, selectedValue, onSelect }) => {
    const isActive = value === selectedValue;
    return (
        <button
            onClick={() => onSelect(value)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${isActive ? 'bg-[var(--primary-600)] text-white shadow-md' : 'bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-secondary)]'}`}
        >
            {label}
        </button>
    );
};

const CategoryBottomSheet: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    categories: UserCategory[];
    selectedValue: string;
    onSelect: (value: string) => void;
}> = ({ isOpen, onClose, categories, selectedValue, onSelect }) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const [dragOffsetY, setDragOffsetY] = useState(0);
    const isDraggingRef = useRef(false);
    const dragStartYRef = useRef(0);
    
    // Use a ref for onClose to avoid re-running effects if onClose is redefined
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    const handleSelect = (value: string) => {
        onSelect(value);
        onClose();
    };
    
    // Define move and end handlers with useCallback for stability
    const handleDragMove = useCallback((e: TouchEvent | MouseEvent) => {
        if (!isDraggingRef.current) return;
        const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const deltaY = y - dragStartYRef.current;
        if (deltaY > 0) { // Only allow dragging down
            setDragOffsetY(deltaY);
        }
    }, []);

    const handleDragEnd = useCallback(() => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;

        // Clean up global listeners
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchend', handleDragEnd);
        
        // Restore transition for the snap-back/close animation
        if (sheetRef.current) {
            sheetRef.current.style.transition = 'transform 0.3s ease-in-out';
        }

        // Use the functional update form of setState to get the latest dragOffsetY
        setDragOffsetY(currentOffsetY => {
            if (currentOffsetY > 100) { // Threshold to close
                onCloseRef.current();
            }
            // Always reset to 0 to trigger the snap-back animation or reset before unmount
            return 0; 
        });

    }, [handleDragMove]); // handleDragMove is a stable dependency

    // Define start handler
    const handleDragStart = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
        isDraggingRef.current = true;
        const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragStartYRef.current = y;

        // Disable transitions during drag for smooth movement
        if (sheetRef.current) {
            sheetRef.current.style.transition = 'none';
        }

        // Add listeners directly when the drag starts
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('touchmove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);
    };

    // A safety cleanup effect in case the component unmounts while dragging
    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [handleDragMove, handleDragEnd]);


    return (
        <div 
            className={`fixed inset-0 z-[90] transition-opacity duration-300 ${isOpen ? 'bg-black/60' : 'bg-transparent pointer-events-none'}`}
            onClick={onClose}
        >
            <div 
                ref={sheetRef}
                className="fixed bottom-0 left-0 right-0 z-[100]"
                style={{
                  transform: isOpen ? `translateY(${dragOffsetY}px)` : `translateY(100%)`,
                  transition: isDraggingRef.current ? 'none' : 'transform 0.3s ease-in-out',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl border-t border-[var(--border-primary)] rounded-t-2xl shadow-2xl flex flex-col"
                    style={{
                        maxHeight: '60vh',
                        paddingBottom: 'calc(env(safe-area-inset-bottom, 0rem) + 8rem)',
                        boxSizing: 'border-box'
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="category-sheet-title"
                >
                    <div 
                      className="p-4 pt-3 flex-shrink-0"
                      onTouchStart={handleDragStart}
                      onMouseDown={handleDragStart}
                    >
                        <div className="w-12 h-1.5 bg-[var(--border-secondary)] rounded-full mx-auto mb-5 cursor-grab active:cursor-grabbing"></div>
                        <h3 id="category-sheet-title" className="text-xl font-bold text-center text-[var(--text-primary)] mb-4">Pilih Kategori</h3>
                    </div>
                    <div className="overflow-y-auto px-4 flex-grow">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleSelect(cat.name)}
                                    className={`w-full p-4 rounded-xl text-center font-semibold transition-all duration-300 transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-glow)] ${selectedValue === cat.name ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white shadow-lg shadow-[var(--primary-glow)]/30 scale-105' : 'bg-[var(--bg-interactive)] text-[var(--text-secondary)] hover:bg-[var(--bg-interactive-hover)]'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Transactions: React.FC<TransactionsProps> = ({ transactions, userCategories, accounts, onAdd, onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc.name])), [accounts]);

  const primaryFilters = useMemo(() => [
        { label: "Semua", value: "all" },
        { label: "Pemasukan", value: "income" },
        { label: "Pengeluaran", value: "expense" }
  ], []);

  const isMoreFilterActive = useMemo(() => !primaryFilters.some(f => f.value === selectedCategory) && selectedCategory !== 'all', [selectedCategory, primaryFilters]);

  const filterBarHeight = isMoreFilterActive ? '112px' : '72px';

  useEffect(() => {
    if (containerRef.current) {
      // Set a CSS custom property on the container element
      containerRef.current.style.setProperty('--filter-bar-height', filterBarHeight);
    }
  }, [filterBarHeight]);

  const groupedAndFilteredTransactions = useMemo(() => {
    const filtered = transactions.filter(t => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'income') return t.type === TransactionType.INCOME;
        if (selectedCategory === 'expense') return t.type === TransactionType.EXPENSE;
        return t.category === selectedCategory;
    });

    const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, tx) => {
      const date = new Date(tx.date);
      const monthYear = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(tx);
      return acc;
    }, {});
    
    const monthMap: { [key: string]: number } = { 'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11 };
    const sortedMonthYears = Object.keys(grouped).sort((a, b) => {
        const [monthBName, yearBStr] = b.split(' ');
        const dateB = new Date(parseInt(yearBStr), monthMap[monthBName]);
        const [monthAName, yearAStr] = a.split(' ');
        const dateA = new Date(parseInt(yearAStr), monthMap[monthAName]);
        return dateB.getTime() - dateA.getTime();
    });

    return sortedMonthYears.reduce<Record<string, Transaction[]>>((sortedAcc, monthYear) => {
        sortedAcc[monthYear] = grouped[monthYear];
        return sortedAcc;
    }, {});

  }, [transactions, selectedCategory]);

  return (
    <>
    <div ref={containerRef} className="p-4 md:p-6 space-y-4 animate-fade-in relative">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Riwayat Transaksi</h1>
      
      <div className="sticky top-0 z-20 py-3 bg-[var(--bg-primary)]/80 backdrop-blur-lg -mx-4 md:-mx-6 px-4 md:px-6 border-b border-[var(--border-primary)] transition-[height] duration-300" style={{ height: 'var(--filter-bar-height, 72px)' }}>
          <div className="flex items-center space-x-1.5">
              {primaryFilters.map(filter => (
                  <FilterChip key={filter.value} {...filter} selectedValue={selectedCategory} onSelect={setSelectedCategory} />
              ))}
              <button
                onClick={() => setIsCategorySheetOpen(true)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0 flex items-center space-x-1.5 ${isMoreFilterActive ? 'bg-[var(--primary-600)] text-white shadow-md' : 'bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-secondary)]'}`}
              >
                  <span>Kategori</span>
                  <i className="fa-solid fa-chevron-down text-xs"></i>
              </button>
          </div>
          {isMoreFilterActive && (
              <div className="mt-3 animate-fade-in">
                  <div className="inline-flex items-center space-x-2 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-full py-1 pl-3 pr-1 text-sm text-[var(--text-secondary)]">
                      <span className="font-medium">Filter: <span className="text-[var(--text-primary)] font-semibold">{selectedCategory}</span></span>
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-interactive-hover)] text-[var(--text-tertiary)] hover:text-[var(--color-expense)] transition-colors"
                        aria-label={`Hapus filter: ${selectedCategory}`}
                      >
                        <i className="fa-solid fa-times text-xs"></i>
                      </button>
                  </div>
              </div>
          )}
      </div>

      <div className="space-y-4 pb-28">
        {Object.keys(groupedAndFilteredTransactions).length > 0 ? (
          Object.entries(groupedAndFilteredTransactions).map(([monthYear, txs], index) => (
            <div key={monthYear} className="relative rounded-2xl p-px bg-gradient-to-b from-white/10 to-transparent animate-fade-in-up" style={{ animationDelay: `${index * 75}ms` }}>
                <details className="group/card bg-[var(--bg-secondary)] rounded-[15px] overflow-hidden" open={index === 0}>
                    <summary className="list-none p-4 cursor-pointer flex justify-between items-center transition-colors group-hover/card:bg-[var(--bg-interactive-hover)]">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">{monthYear}</h2>
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg">
                            <i className="fa-solid fa-chevron-down text-[var(--text-tertiary)] transition-transform duration-300 group-open/card:rotate-180"></i>
                        </div>
                    </summary>
                    <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-in-out group-open/card:grid-rows-[1fr]">
                        <div className="overflow-hidden">
                            <div className="border-t border-[var(--border-primary)] p-4">
                                <div className="space-y-3 stagger-children">
                                    {txs.map((tx, txIndex) => (
                                        <TransactionItem
                                            key={tx.id}
                                            transaction={tx}
                                            style={{ animationDelay: `${txIndex * 50}ms` }}
                                            onSelect={onSelect}
                                            accountName={accountMap.get(tx.accountId)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </details>
            </div>
          ))
        ) : (
            <div className="relative rounded-2xl p-px bg-gradient-to-b from-white/10 to-transparent mt-4">
              <div className="bg-[var(--bg-secondary)] rounded-[15px] text-center p-8">
                <i className="fa-solid fa-folder-open text-4xl text-[var(--text-tertiary)] mb-4"></i>
                <p className="font-semibold text-[var(--text-primary)]">Tidak Ada Transaksi</p>
                <p className="text-sm text-[var(--text-tertiary)]">Tidak ada transaksi yang cocok dengan filter Anda.</p>
              </div>
            </div>
        )}
      </div>

      <button
        onClick={onAdd}
        className="fixed bottom-28 right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-2xl hidden md:flex items-center justify-center text-white shadow-lg shadow-[var(--primary-glow)]/30 transform hover:scale-110 transition-all z-30"
        style={{ backgroundImage: 'var(--gradient-primary)' }}
        aria-label="Tambah Transaksi Baru"
      >
        <i className="fa-solid fa-plus text-xl"></i>
      </button>
    </div>
    <CategoryBottomSheet 
        isOpen={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
        categories={userCategories}
        selectedValue={selectedCategory}
        onSelect={setSelectedCategory}
    />
    </>
  );
};

export default Transactions;