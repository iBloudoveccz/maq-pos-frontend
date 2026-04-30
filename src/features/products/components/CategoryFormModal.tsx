import { useState, useEffect } from 'react';
import { X, FolderPlus, Folder, Trash2, AlertTriangle } from 'lucide-react';
import type { Category, CreateCategoryDto } from '../types';

interface Props {
  mode: 'create' | 'create-sub' | 'edit' | 'delete';
  category?: Category; // para edit/delete o parent en create-sub
  categories: Category[];
  onConfirm: (data?: CreateCategoryDto | { name: string }) => void;
  onClose: () => void;
  loading?: boolean;
}

export default function CategoryFormModal({
  mode, category, onConfirm, onClose, loading
}: Props) {
  const [name, setName] = useState(category?.name ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit') setName(category?.name ?? '');
  }, [mode, category]);

  const handleSubmit = () => {
    if (mode === 'delete') { onConfirm(); return; }
    if (!name.trim()) { setError('El nombre es requerido'); return; }

    if (mode === 'create')     onConfirm({ name: name.trim(), parentId: null });
    if (mode === 'create-sub') onConfirm({ name: name.trim(), parentId: category?.id });
    if (mode === 'edit')       onConfirm({ name: name.trim() });
  };

  const titles = {
    'create':     'Nueva categoría',
    'create-sub': `Nueva subcategoría en "${category?.name}"`,
    'edit':       `Editar "${category?.name}"`,
    'delete':     `Eliminar "${category?.name}"`,
  };

  const isDelete = mode === 'delete';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 ${
          isDelete ? 'bg-red-50 border-b border-red-100' : 'bg-slate-50 border-b border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            {isDelete
              ? <AlertTriangle size={18} className="text-red-500" />
              : mode === 'create' || mode === 'create-sub'
                ? <FolderPlus size={18} className="text-indigo-500" />
                : <Folder size={18} className="text-amber-500" />
            }
            <h3 className="font-semibold text-slate-800 text-sm">{titles[mode]}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {isDelete ? (
            <div className="text-sm text-slate-600">
              <p className="mb-2">
                ¿Estás seguro de eliminar la categoría <strong>"{category?.name}"</strong>?
              </p>
              <p className="text-red-500 text-xs">
                {(category?._count?.products ?? 0) > 0
                  ? `⚠ Esta categoría tiene ${category?._count?.products} productos asociados. No se puede eliminar.`
                  : 'Esta acción no se puede deshacer.'
                }
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nombre de la categoría
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Ej: BEBIDAS Y REFRESCOS"
                autoFocus
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all
                  ${error
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-400'
                  }`}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          {isDelete ? (
            <button
              onClick={handleSubmit}
              disabled={loading || (category?._count?.products ?? 0) > 0}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Trash2 size={14} />
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading ? 'Guardando...' : mode === 'edit' ? 'Guardar cambios' : 'Crear'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
