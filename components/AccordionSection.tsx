import React from 'react';

export const AccordionSection: React.FC<{ 
  title: string, 
  children: React.ReactNode, 
  isOpen?: boolean,
  headerClassName?: string 
}> = ({ title, children, isOpen = false, headerClassName = '' }) => (
    <details className="group bg-gray-50 dark:bg-gray-800/50 rounded-lg" open={isOpen}>
        <summary className={`font-semibold cursor-pointer list-none flex justify-between items-center p-4 rounded-t-lg ${headerClassName}`}>
            {title}
            <i className="fa-solid fa-chevron-down transition-transform duration-300 group-open:rotate-180"></i>
        </summary>
        <div className="p-4 border-t border-black/5 dark:border-white/10">
            {children}
        </div>
    </details>
);