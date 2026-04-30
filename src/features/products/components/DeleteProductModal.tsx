import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { Product } from '../types';

interface Props {
  product: Product;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export default function DeleteProductModal({ product, onConfirm, onClose, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-100 bg-red-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="font-semibold text-red-800 text-sm">Eliminar producto</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-600 mb-1">
            ¿Eliminar el producto <strong>"{product.name}"</strong>?
          </p>
          <p className="text-xs text-slate-400">Código: {product.code}</p>
          <p className="text-xs text-red-500 mt-3">Esta acción no se puede deshacer.</p>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} />
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
