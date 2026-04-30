import { useState } from 'react';
import {
  ChevronRight, ChevronDown, Folder, FolderOpen,
  Plus, Edit2, Trash2, FolderPlus, MoreVertical
} from 'lucide-react';
import type { Category } from '../types';

interface Props {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onCreateRoot: () => void;
  onCreateSub: (parent: Category) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  loading?: boolean;
}

function CategoryNode({
  category, level, selectedId, onSelect, onCreateSub, onEdit, onDelete,
}: {
  category: Category; level: number; selectedId: number | null;
  onSelect: (id: number | null) => void;
  onCreateSub: (cat: Category) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  const [open, setOpen]       = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const hasChildren = (category.children?.length ?? 0) > 0;
  const isSelected  = selectedId === category.id;

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 py-[6px] px-2 rounded-md cursor-pointer text-sm transition-all select-none
          ${isSelected
            ? 'bg-indigo-600 text-white'
            : 'text-slate-700 hover:bg-slate-100'
          }`}
        style={{ paddingLeft: `${10 + level * 18}px` }}
        onClick={() => {
          onSelect(isSelected ? null : category.id);
          if (hasChildren) setOpen(o => !o);
        }}
      >
        {/* Expand chevron */}
        <span className="w-3.5 flex-shrink-0 flex items-center">
          {hasChildren
            ? open ? <ChevronDown size={11} /> : <ChevronRight size={11} />
            : level > 0 ? <span className="text-slate-300 text-xs">└</span> : null
          }
        </span>

        {/* Icon */}
        {isSelected
          ? <FolderOpen size={14} className="flex-shrink-0 text-indigo-200" />
          : <Folder size={14} className={`flex-shrink-0 ${level === 0 ? 'text-amber-400' : 'text-slate-400'}`} />
        }

        {/* Name */}
        <span className="flex-1 truncate text-xs font-medium leading-tight" title={category.name}>
          {category.name}
        </span>

        {/* Count badge */}
        {(category._count?.products ?? 0) > 0 && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-semibold ${
            isSelected ? 'bg-indigo-500 text-indigo-100' : 'bg-slate-200 text-slate-500'
          }`}>
            {category._count?.products}
          </span>
        )}

        {/* Menu button */}
        <div className="relative ml-0.5">
          <button
            onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
            className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
              isSelected ? 'hover:bg-indigo-500' : 'hover:bg-slate-200'
            }`}
          >
            <MoreVertical size={11} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute left-0 top-5 z-20 bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-52 text-xs">
                <button
                  onClick={e => { e.stopPropagation(); setShowMenu(false); onCreateSub(category); }}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700"
                >
                  <FolderPlus size={13} className="text-indigo-500" />
                  Nueva subcategoría
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setShowMenu(false); onEdit(category); }}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-50 text-slate-700"
                >
                  <Edit2 size={13} className="text-slate-400" />
                  Editar
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={e => { e.stopPropagation(); setShowMenu(false); onDelete(category); }}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-500"
                >
                  <Trash2 size={13} />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && open && (
        <div className="border-l border-slate-200 ml-[22px]">
          {category.children!.map(child => (
            <CategoryNode
              key={child.id} category={child} level={level + 1}
              selectedId={selectedId} onSelect={onSelect}
              onCreateSub={onCreateSub} onEdit={onEdit} onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryPanel({
  categories, selectedId, onSelect,
  onCreateRoot, onCreateSub, onEdit, onDelete, loading
}: Props) {
  const roots = categories.filter(c => c.parentId === null);
  const addChildren = (cats: Category[]): Category[] =>
    cats.map(c => ({
      ...c,
      children: addChildren(categories.filter(ch => ch.parentId === c.id)),
    }));
  const tree = addChildren(roots);

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 bg-slate-50 flex-shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categorías</span>
        <button
          onClick={onCreateRoot}
          title="Nueva categoría raíz"
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-indigo-100 text-indigo-600 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* "Todos" option */}
      <div className="px-2 pt-2 flex-shrink-0">
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-semibold transition-all ${
            selectedId === null
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Folder size={13} className={selectedId === null ? 'text-indigo-200' : 'text-slate-400'} />
          Todos los productos
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 my-2 border-t border-slate-100 flex-shrink-0" />

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {loading ? (
          <p className="text-xs text-slate-400 px-2 py-3 text-center">Cargando...</p>
        ) : tree.length === 0 ? (
          <div className="text-center py-6">
            <FolderPlus size={22} className="mx-auto mb-1.5 text-slate-300" />
            <p className="text-xs text-slate-400">Sin categorías</p>
            <button
              onClick={onCreateRoot}
              className="mt-2 text-xs text-indigo-600 hover:underline"
            >
              + Crear primera categoría
            </button>
          </div>
        ) : (
          tree.map(cat => (
            <CategoryNode
              key={cat.id} category={cat} level={0}
              selectedId={selectedId} onSelect={onSelect}
              onCreateSub={onCreateSub} onEdit={onEdit} onDelete={onDelete}
            />
          ))
        )}
      </div>
    </aside>
  );
}
