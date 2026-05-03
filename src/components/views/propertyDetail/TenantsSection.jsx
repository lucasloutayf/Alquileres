import { Plus, TrendingUp, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../common/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../common/Table';
import { getTenantPaymentStatus } from '../../../utils/paymentUtils';
import { getTenantStatusBadge } from './getTenantStatusBadge';
import BulkRentToolbar from './BulkRentToolbar';
import TenantActions from './TenantActions';

const SORT_OPTIONS = [
  { key: 'name', labelKey: 'name' },
  { key: 'room', labelKey: 'room' },
  { key: 'rent', labelKey: 'rent' },
  { key: 'status', labelKey: 'status' },
];

const SortIndicator = ({ active, direction }) =>
  active ? (
    <span className="text-emerald-600 dark:text-emerald-400">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  ) : null;

const TenantsSection = ({
  tenants,
  allPayments,
  sortConfig,
  bulkMode,
  selectedIds,
  increaseAmount,
  increaseSign,
  isApplyingIncrease,
  onSort,
  onToggleBulkMode,
  onToggleSelect,
  onToggleSelectAll,
  onSetIncreaseAmount,
  onToggleSign,
  onApplyBulkIncrease,
  onAddTenant,
  onEditTenant,
  onPayments,
  onGenerateReport,
  onRequestDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('propertyDetail.tenantsTitle')}
        </h2>
        <div className="flex items-center gap-2">
          {!bulkMode && (
            <>
              <Button
                variant="outline"
                onClick={onToggleBulkMode}
                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-900/20"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Aumentar monto
              </Button>
              <Button variant="default" onClick={onAddTenant}>
                <Plus className="w-4 h-4 mr-2" />
                {t('propertyDetail.addTenant')}
              </Button>
            </>
          )}
          {bulkMode && (
            <Button variant="ghost" onClick={onToggleBulkMode} className="text-gray-500">
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {bulkMode && (
        <BulkRentToolbar
          tenants={tenants}
          selectedIds={selectedIds}
          increaseAmount={increaseAmount}
          increaseSign={increaseSign}
          isApplyingIncrease={isApplyingIncrease}
          onSetAmount={onSetIncreaseAmount}
          onToggleSign={onToggleSign}
          onToggleSelectAll={onToggleSelectAll}
          onApply={onApplyBulkIncrease}
        />
      )}

      <div className="md:hidden space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">
            Ordenar:
          </span>
          {SORT_OPTIONS.map(({ key, labelKey }) => {
            const active = sortConfig.key === key;
            return (
              <button
                key={key}
                onClick={() => onSort(key)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-emerald-400'
                }`}
              >
                {t(`propertyDetail.table.${labelKey}`)}
                {active && <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </button>
            );
          })}
        </div>

        {tenants.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('propertyDetail.noTenants')}
          </p>
        ) : (
          tenants.map((tenant) => {
            const paymentStatus = getTenantPaymentStatus(tenant, allPayments || []);
            const { label, colorClass } = getTenantStatusBadge(tenant, paymentStatus, t);
            const isSelected = selectedIds.has(tenant.id);

            return (
              <div
                key={tenant.id}
                onClick={bulkMode ? () => onToggleSelect(tenant.id) : undefined}
                className={`bg-white dark:bg-gray-800 rounded-xl border p-4 shadow-sm transition-colors ${
                  bulkMode
                    ? isSelected
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 cursor-pointer'
                      : 'border-gray-200 dark:border-gray-700 cursor-pointer hover:border-emerald-300'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {bulkMode && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(tenant.id)}
                        onClick={e => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                      />
                    )}
                    <p className="font-semibold text-gray-900 dark:text-white leading-tight">
                      {tenant.name}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
                  >
                    {label}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span>
                    Hab. <strong className="text-gray-900 dark:text-white">{tenant.roomNumber}</strong>
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${tenant.rentAmount.toLocaleString('es-AR')}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <TenantActions
                    tenant={tenant}
                    onPayments={onPayments}
                    onEdit={onEditTenant}
                    onReport={onGenerateReport}
                    onDelete={onRequestDelete}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
              {bulkMode && <TableHead className="w-10 text-gray-500 dark:text-gray-400" />}
              <TableHead className="text-gray-500 dark:text-gray-400">
                {t('propertyDetail.table.name')}
              </TableHead>
              {['room', 'rent', 'status'].map((key) => (
                <TableHead
                  key={key}
                  onClick={() => onSort(key)}
                  className="cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors select-none text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center gap-1">
                    {t(`propertyDetail.table.${key}`)}
                    <SortIndicator active={sortConfig.key === key} direction={sortConfig.direction} />
                  </div>
                </TableHead>
              ))}
              {!bulkMode && (
                <TableHead className="text-gray-500 dark:text-gray-400">
                  {t('propertyDetail.table.actions')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow className="border-0">
                <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t('propertyDetail.noTenants')}
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant, index) => {
                const paymentStatus = getTenantPaymentStatus(tenant, allPayments || []);
                const { label, colorClass } = getTenantStatusBadge(tenant, paymentStatus, t);
                const isSelected = selectedIds.has(tenant.id);

                return (
                  <TableRow
                    key={tenant.id}
                    transition={{ delay: index * 0.05 }}
                    onClick={bulkMode ? () => onToggleSelect(tenant.id) : undefined}
                    className={`border-b border-gray-100 dark:border-gray-700/50 last:border-0 ${
                      bulkMode
                        ? isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 cursor-pointer'
                          : 'hover:bg-emerald-50/50 cursor-pointer'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {bulkMode && (
                      <TableCell className="w-10" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(tenant.id)}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {tenant.name}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {tenant.roomNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-white">
                      ${tenant.rentAmount.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
                      >
                        {label}
                      </span>
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      {!bulkMode && (
                        <TenantActions
                          tenant={tenant}
                          onPayments={onPayments}
                          onEdit={onEditTenant}
                          onReport={onGenerateReport}
                          onDelete={onRequestDelete}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TenantsSection;
