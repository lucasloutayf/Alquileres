import { Check } from 'lucide-react';
import Button from '../../common/Button';

const BulkRentToolbar = ({
  tenants,
  selectedIds,
  increaseAmount,
  increaseSign,
  isApplyingIncrease,
  onSetAmount,
  onToggleSign,
  onToggleSelectAll,
  onApply,
}) => {
  const allSelected = selectedIds.size === tenants.length && tenants.length > 0;
  const selectAllLabel = allSelected
    ? 'Deseleccionar todo'
    : `Seleccionar todo (${tenants.length})`;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="checkbox"
          id="select-all-tenants"
          checked={allSelected}
          onChange={() => onToggleSelectAll(tenants)}
          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
        />
        <label
          htmlFor="select-all-tenants"
          className="text-sm font-medium text-emerald-800 dark:text-emerald-200 cursor-pointer select-none whitespace-nowrap"
        >
          {selectAllLabel}
        </label>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-[180px]">
        <button
          onClick={onToggleSign}
          className={`shrink-0 w-9 h-9 rounded-lg text-base font-bold border-2 transition-colors ${
            increaseSign === '+'
              ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
              : 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
          }`}
          title={
            increaseSign === '+'
              ? 'Modo aumento (click para restar)'
              : 'Modo reducción (click para sumar)'
          }
        >
          {increaseSign}
        </button>
        <span className="text-sm text-emerald-700 dark:text-emerald-300 shrink-0">$</span>
        <input
          type="number"
          min="0"
          placeholder="ej: 5000"
          value={increaseAmount}
          onChange={e => onSetAmount(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <Button
        onClick={() => onApply(tenants)}
        disabled={isApplyingIncrease || selectedIds.size === 0 || !increaseAmount}
        className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 shrink-0"
      >
        <Check className="w-4 h-4 mr-1" />
        {isApplyingIncrease
          ? 'Aplicando...'
          : `Aplicar${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
      </Button>
    </div>
  );
};

export default BulkRentToolbar;
