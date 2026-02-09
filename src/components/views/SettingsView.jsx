import React, { useState } from 'react';
import { 
  Save, 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  Database,
  Shield, 
  AlertTriangle,
  Globe
} from 'lucide-react';
import Button from '../common/Button';
import { useProperties } from '../../hooks/useProperties';
import { useTenants } from '../../hooks/useTenants';
import { usePayments } from '../../hooks/usePayments';
import { useExpenses } from '../../hooks/useExpenses';
import { exportFullData } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

import { useTranslation } from 'react-i18next';

const SettingsView = ({ user }) => {
  const { t, i18n } = useTranslation();
  const { properties } = useProperties(user?.uid);
  const { tenants } = useTenants(user?.uid);
  const { allPayments: payments } = usePayments(user?.uid);
  const { expenses } = useExpenses(user?.uid);
  
  const [loading, setLoading] = useState(false);

  const handleBackup = async (format) => {
    try {
      setLoading(true);
      
      const fullData = {
        properties,
        tenants,
        payments,
        expenses,
        exportedAt: new Date().toISOString(),
        user: user?.email
      };
      
      await exportFullData(fullData, format);
      
      toast.success(`Backup ${format.toUpperCase()} descargado correctamente`);
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Error al crear el backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Database className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
          {t('settings.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('settings.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Sección de Backups */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t('settings.backup.title')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('settings.backup.desc')}
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">{t('settings.backup.recommendation')}</p>
                <p>{t('settings.backup.recText')}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button
                onClick={() => handleBackup('json')}
                disabled={loading}
                className="flex items-center gap-2 flex-1 justify-center"
                variant="primary"
              >
                <FileJson className="w-4 h-4" />
                {loading ? t('common.loading') : t('settings.backup.downloadJSON')}
              </Button>
              
              <Button
                onClick={() => handleBackup('excel')}
                disabled={loading}
                className="flex items-center gap-2 flex-1 justify-center"
                variant="secondary"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {loading ? t('common.loading') : t('settings.backup.downloadExcel')}
              </Button>
            </div>
            
            <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
              {t('settings.backup.note')}
            </p>
          </div>
        </div>

        {/* Sección de Restauración (Información) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {t('settings.restore.title')}
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('settings.restore.desc')}
            </p>
          </div>
        </div>

      </div>

      {/* Sección de Preferencias / Idioma */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {t('settings.language.title')}
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('settings.language.desc')}
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { code: 'es', label: '🇪🇸 Español' },
              { code: 'en', label: '🇬🇧 English' },
              { code: 'pt', label: '🇧🇷 Português' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`
                  px-4 py-2 rounded-lg border text-sm font-medium transition-all
                  ${i18n.language === lang.code 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500/50 dark:text-emerald-400 ring-1 ring-emerald-500' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
