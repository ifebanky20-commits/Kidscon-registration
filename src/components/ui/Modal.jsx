import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, className }) {
  
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; 
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300 ease-md">
      <div 
        className={cn(
          "bg-md-surface-container rounded-[28px] md-elevation-3 w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-md", 
          className
        )}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-medium text-md-on-background tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-md-on-surface-variant hover:text-md-on-background hover:bg-md-on-surface-variant/10 active:bg-md-on-surface-variant/20 rounded-full transition-colors active:scale-95"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 pt-2 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
