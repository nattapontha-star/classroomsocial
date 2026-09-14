import React from 'react';

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmDialogModalProps {
  state: ConfirmDialogState | null;
  onClose: () => void;
}

export const ConfirmDialogModal: React.FC<ConfirmDialogModalProps> = ({ state, onClose }) => {
  if (!state || !state.isOpen) return null;

  const handleCancel = () => {
    if (state.onCancel) state.onCancel();
    onClose();
  };

  const handleConfirm = () => {
    state.onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e6eeff] space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              state.isDanger ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#eff4ff] text-[#00173b]'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {state.isDanger ? 'delete_forever' : 'help'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-[#00173b]">{state.title}</h3>
            <p className="text-xs text-[#44474f] mt-1.5 leading-relaxed whitespace-pre-line">
              {state.message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#e6eeff]">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {state.cancelText || 'ยกเลิก'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs ${
              state.isDanger
                ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white'
                : 'bg-[#00173b] hover:bg-[#0f2c59] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {state.isDanger ? 'delete' : 'check'}
            </span>
            <span>{state.confirmText || 'ยืนยัน'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
