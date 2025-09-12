import React from 'react';

export const AccordionSection: React.FC<{ 
  title: string, 
  children: React.ReactNode, 
  isOpen?: boolean,
  headerClassName?: string,
  badge?: React.ReactNode
}> = ({ title, children, isOpen = false, headerClassName = '', badge }) => (
    <details className="group bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-xl" open={isOpen}>
        <summary className={`font-semibold cursor-pointer list-none flex justify-between items-center p-4 rounded-t-lg transition-colors duration-300 hover:bg-[var(--bg-interactive-hover)] ${headerClassName}`}>
            <div className="flex items-center space-x-3">
                <span className="text-[var(--text-primary)]">{title}</span>
                {badge}
            </div>
            <div className="w-7 h-7 flex items-center justify-center bg-[var(--bg-interactive)] rounded-full">
              <i className="fa-solid fa-chevron-down text-[var(--text-tertiary)] text-xs transition-transform duration-300 group-open:rotate-180"></i>
            </div>
        </summary>
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-in-out group-open:grid-rows-[1fr]">
            <div className="overflow-hidden">
                <div className="p-4 border-t border-[var(--border-primary)]">
                    {children}
                </div>
            </div>
        </div>
    </details>
);