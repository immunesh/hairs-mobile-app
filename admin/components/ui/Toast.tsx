'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const styles = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-blue-200 bg-blue-50',
};

export default function Toast() {
  const { toast, clearToast } = useUIStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(clearToast, 3500);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl bg-white max-w-sm',
        styles[toast.type]
      )}>
        {icons[toast.type]}
        <p className="text-sm font-medium text-gray-800 flex-1">{toast.message}</p>
        <button onClick={clearToast} className="text-gray-400 hover:text-gray-600 ml-2">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
