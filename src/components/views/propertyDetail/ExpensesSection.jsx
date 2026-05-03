import { Plus, Trash2 } from 'lucide-react';
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

const ExpensesSection = ({
  expenses,
  hasMore,
  loadingMore,
  onAddExpense,
  onLoadMore,
  onRequestDelete,
}) => {
  const { t } = useTranslation();
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('propertyDetail.expensesTitle')}
        </h2>
        <Button variant="default" onClick={onAddExpense}>
          <Plus className="w-4 h-4 mr-2" />
          {t('propertyDetail.addExpense')}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
              <TableHead className="text-gray-500 dark:text-gray-400">
                {t('propertyDetail.table.description')}
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400">
                {t('propertyDetail.table.category')}
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400">
                {t('propertyDetail.table.amount')}
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400">
                {t('propertyDetail.table.date')}
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400">
                {t('propertyDetail.table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.length === 0 ? (
              <TableRow className="border-0">
                <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t('propertyDetail.noExpenses')}
                </TableCell>
              </TableRow>
            ) : (
              sortedExpenses.map((expense, index) => (
                <TableRow
                  key={expense.id}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                >
                  <TableCell className="text-gray-900 dark:text-white font-medium">
                    {expense.description}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {expense.category}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-white font-semibold">
                    ${expense.amount.toLocaleString('es-AR')}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {new Date(expense.date).toLocaleDateString('es-AR')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRequestDelete(expense)}
                      title="Eliminar gasto"
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-4 mb-6">
          <Button variant="secondary" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? t('common.loading') : t('expenses.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExpensesSection;
