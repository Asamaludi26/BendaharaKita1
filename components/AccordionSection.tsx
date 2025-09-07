import React from 'react';

export const AccordionSection: React.FC<{ 
  title: string, 
  children: React.ReactNode, 
  isOpen?: boolean,
  headerClassName?: string 
}> = ({ title, children, isOpen = false, headerClassName = '' }) => (
    <details className="group bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl" open={isOpen}>
        <summary className={`font-semibold cursor-pointer list-none flex justify-between items-center p-4 rounded-t-lg transition-colors duration-300 hover:bg-white/5 ${headerClassName}`}>
            {title}
            <div className="w-7 h-7 flex items-center justify-center bg-white/5 rounded-full">
              <i className="fa-solid fa-chevron-down text-gray-400 text-xs transition-transform duration-300 group-open:rotate-180"></i>
            </div>
        </summary>
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-in-out group-open:grid-rows-[1fr]">
            <div className="overflow-hidden">
                <div className="p-4 border-t border-white/10">
                    {children}
                </div>
            </div>
        </div>
    </details>
);