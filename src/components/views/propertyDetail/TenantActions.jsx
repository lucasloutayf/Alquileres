import { Edit, FileText, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../common/Button';

const TenantActions = ({ tenant, onPayments, onEdit, onReport, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={() => onPayments(tenant)}>
        {t('common.payments')}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(tenant)}
        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onReport(tenant)}
        title="Descargar reporte"
        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <FileText className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(tenant)}
        title="Eliminar inquilino"
        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default TenantActions;
