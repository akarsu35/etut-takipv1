import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  children,
  footer,
}) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left cursor-pointer"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
        <h3 className="font-bold text-gray-800 text-lg flex items-center">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t bg-gray-50 shrink-0">{footer}</div>
      )}
    </div>
  </div>
)
