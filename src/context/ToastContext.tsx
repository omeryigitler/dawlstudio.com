import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, AlertCircle, Info, Bell } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <div className={`
                min-w-[320px] max-w-md p-4 flex items-start gap-4 
                bg-charcoal-light border backdrop-blur-md shadow-2xl
                ${toast.type === "success" ? "border-emerald-500/30" : 
                  toast.type === "error" ? "border-red-500/30" : 
                  toast.type === "warning" ? "border-amber-500/30" : 
                  "border-gold/30"}
              `}>
                <div className={`mt-0.5 ${
                  toast.type === "success" ? "text-emerald-400" : 
                  toast.type === "error" ? "text-red-400" : 
                  toast.type === "warning" ? "text-amber-400" : 
                  "text-gold"
                }`}>
                  {toast.type === "success" && <CheckCircle2 size={18} />}
                  {toast.type === "error" && <AlertCircle size={18} />}
                  {toast.type === "warning" && <Bell size={18} />}
                  {toast.type === "info" && <Info size={18} />}
                </div>
                
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-limestone/40 mb-1">
                    {toast.type}
                  </p>
                  <p className="text-xs tracking-widest text-offwhite leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="text-limestone/40 hover:text-gold transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: 0 }}
                transition={{ duration: 5, ease: "linear" }}
                className={`h-[1px] mt-[-1px] ${
                  toast.type === "success" ? "bg-emerald-500" : 
                  toast.type === "error" ? "bg-red-500" : 
                  toast.type === "warning" ? "bg-amber-500" : 
                  "bg-gold"
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
