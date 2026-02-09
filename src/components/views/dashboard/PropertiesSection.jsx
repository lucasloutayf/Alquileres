import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../../common/Button';
import PropertyCard from '../../properties/PropertyCard';
import { useTranslation } from 'react-i18next';

/**
 * Sección de propiedades con grid y estado vacío.
 */
const PropertiesSection = ({ 
  properties, 
  tenants,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
  onPropertyClick
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.properties')}
        </h2>
        <Button variant="link" className="text-sm h-auto p-0">
          {t('common.viewAll')}
        </Button>
      </div>
      
      {properties.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-dashed rounded-xl p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('dashboard.noProperties')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('dashboard.startAdding')}
            </p>
            <Button onClick={onAddProperty}>
              <Plus className="w-4 h-4 mr-2" />
              {t('dashboard.addProperty')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map(prop => (
            <PropertyCard
              key={prop.id}
              property={prop}
              tenants={tenants}
              onEdit={onEditProperty}
              onDelete={onDeleteProperty}
              onClick={() => onPropertyClick(prop.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesSection;
