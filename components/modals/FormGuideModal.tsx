// FIX: Create the FormGuideModal component from scratch to resolve module import errors and provide user guidance on application workflow.
import React from 'react';

// A simple parser to highlight key terms
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

const GuideSection: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => (
    <details className="group bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-xl" open={defaultOpen}>
        <summary className="font-semibold cursor-pointer list-none flex justify-between items-center p-4">
            <span className="text-[var(--text-primary)]">{title}</span>
            <i className="fa-solid fa-chevron-down text-[var(--text-tertiary)] transition-transform duration-300 group-open:rotate-180"></i>
        </summary>
        <div className="p-4 border-t border-[var(--border-primary)] text-sm text-[var(--text-secondary)] leading-relaxed">
            {children}
        </div>
    </details>
);


interface FormGuideModalProps {
    onClose: () => void;
}

const FormGuideModal: React.FC<FormGuideModalProps> = ({ onClose }) => {
    return (
        <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-interactive)] flex items-center justify-center border border-[var(--border-primary)] flex-shrink-0">
                      <i className="fa-solid fa-file-pen text-2xl text-[var(--primary-glow)]"></i>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-[var(--text-primary)]">Panduan Pengisian Form</h1>
                      <p className="text-sm text-[var(--text-tertiary)]">Pahami alur kerja cerdas aplikasi.</p>
                    </div>
                </div>
                 <button 
                    onClick={onClose} 
                    className="w-8 h-8 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors"
                    aria-label="Close"
                >
                    <i className="fa-solid fa-times text-lg"></i>
                </button>
            </header>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                <GuideSection title="1. Alur Kerja Cerdas" defaultOpen={true}>
                    <p>
                        Aplikasi ini dirancang agar Anda **hanya perlu merencanakan di awal**, lalu **mencatat transaksi harian**. Sisanya, kami yang urus!
                    </p>
                    <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>Buat **Goals** jangka panjang (utang & tabungan).</li>
                        <li>Buat **Target Bulanan** (bisa otomatis menarik data dari Goals).</li>
                        <li>Catat **Transaksi** harian Anda.</li>
                        <li>Lihat **Laporan Aktual** terisi otomatis dan bandingkan dengan target Anda.</li>
                    </ol>
                </GuideSection>

                <GuideSection title="2. Form Target Bulanan">
                    <p>
                        Ini adalah **anggaran bulanan** Anda. Isilah pos-pos pendapatan dan pengeluaran yang Anda rencanakan.
                    </p>
                    <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>{renderContentWithHighlight("Bagian **'Hutang'** dan **'Tabungan'** akan otomatis terisi jika Anda sudah membuat Goals. Anda tidak bisa menambah item manual di sini.")}</li>
                        <li>{renderContentWithHighlight("Gunakan opsi **'Salin dari Bulan Lalu'** saat mengubah target untuk mempercepat proses.")}</li>
                         <li>{renderContentWithHighlight("**'Potensi Sisa Uang'** adalah indikator kesehatan rencana Anda. Usahakan nilainya positif!")}</li>
                    </ul>
                </GuideSection>

                <GuideSection title="3. Form Goals (Utang & Tabungan)">
                     <p>
                        Gunakan form ini untuk mencatat komitmen finansial jangka panjang.
                    </p>
                    <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>{renderContentWithHighlight("Data yang Anda masukkan di sini (misal: cicilan per bulan) akan menjadi **pilihan otomatis** saat Anda membuat Target Bulanan.")}</li>
                         <li>{renderContentWithHighlight("Saat Anda **mencatat pembayaran** utang atau **menambah dana** tabungan, data tersebut juga akan otomatis masuk ke Laporan Aktual bulanan.")}</li>
                    </ul>
                </GuideSection>
                
                <GuideSection title="4. Form Transaksi">
                     <p>
                        Ini adalah form yang akan paling sering Anda gunakan. Catat semua pemasukan dan pengeluaran di sini.
                    </p>
                     <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>{renderContentWithHighlight("Kunci dari otomatisasi adalah **konsistensi kategori**. Pastikan Anda memilih kategori yang sesuai.")}</li>
                        <li>{renderContentWithHighlight("Misalnya, transaksi dengan kategori **'Sewa'** akan otomatis dijumlahkan dan ditampilkan di baris 'Sewa' pada Laporan Aktual Anda.")}</li>
                         <li>{renderContentWithHighlight("Pilih **'Akun'** yang benar agar saldo di Dompet Anda selalu akurat.")}</li>
                    </ul>
                </GuideSection>
            </div>

             <div className="mt-6">
                <button 
                    onClick={onClose} 
                    className="w-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg"
                >
                    Saya Mengerti
                </button>
            </div>
        </div>
    );
};

export default FormGuideModal;
