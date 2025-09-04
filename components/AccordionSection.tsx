import React from 'react';

export const AccordionSection: React.FC<{ title: string, children: React.ReactNode, isOpen?: boolean }> = ({ title, children, isOpen = false }) => (
    <details className="group bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 open:ring-1 open:ring-black/5 dark:open:ring-white/10 open:shadow-lg" open={isOpen}>
        <summary className="font-medium text-gray-800 dark:text-white cursor-pointer list-none flex justify-between items-center">
            {title}
            <i className="fa-solid fa-chevron-down transition-transform duration-300 group-open:rotate-180"></i>
        </summary>
        <div className="mt-4">
            {children}
        </div>
    </details>
);
