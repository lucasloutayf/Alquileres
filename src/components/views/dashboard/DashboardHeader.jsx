import React from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Download } from 'lucide-react';
import Button from '../../common/Button';
import { useTranslation } from 'react-i18next';

/**
 * Header del Dashboard con parallax y botones de acción.
 */
const DashboardHeader = ({ 
  headerY, 
  headerOpacity, 
  onAddProperty, 
  onGenerateReport, 
  onExportExcel 
}) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      style={{ y: headerY, opacity: headerOpacity }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10"
    >
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
          {t('dashboard.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('dashboard.subtitle')}
        </p>
      </div>
      <div className="flex gap-3 w-full sm:w-auto">
        <Button 
          variant="outline" 
          onClick={onExportExcel}
          className="flex-1 sm:flex-initial"
          title="Exportar a Excel"
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Excel</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={onGenerateReport}
          className="flex-1 sm:flex-initial"
        >
          <FileText className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{t('dashboard.monthlyReport')}</span>
          <span className="sm:hidden">{t('common.report')}</span>
        </Button>
        <Button 
          variant="default" 
          onClick={onAddProperty}
          className="flex-1 sm:flex-initial"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.addProperty')}
        </Button>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
