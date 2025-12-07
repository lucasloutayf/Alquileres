import React from 'react';
import { Edit, Trash2, Users, DollarSign, MapPin } from 'lucide-react';
import { Card, CardContent } from '../common/Card';
import Button from '../common/Button';
import IsometricBuilding from '../common/IsometricBuilding';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

const PropertyCard = ({ property, tenants, onEdit, onDelete, onClick }) => {
  const propTenants = tenants.filter(t => t.propertyId === property.id && t.contractStatus === 'activo');
  const occupancyRate = property.totalRooms > 0 ? (propTenants.length / property.totalRooms) * 100 : 0;
  const monthlyIncome = propTenants.reduce((sum, t) => sum + t.rentAmount, 0);

  // Determine color theme based on occupancy or random for variety
  const getColorTheme = () => {
    if (occupancyRate >= 80) return 'emerald';
    if (occupancyRate >= 50) return 'blue';
    if (occupancyRate > 0) return 'amber';
    return 'purple';
  };

  const theme = getColorTheme();

  return (
    <Card 
      hover3d 
      className="group cursor-pointer overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 h-full shadow-sm"
      onClick={onClick}
    >
      <CardContent className="p-0 h-full flex flex-col">
        {/* Header / Visualization */}
        <div className="relative h-40 bg-gray-50 dark:bg-gray-900/50 p-6 overflow-visible">
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button
              variant="glass"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 shadow-sm"
              onClick={(e) => { e.stopPropagation(); onEdit(property, e); }}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="glass"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-rose-500 hover:text-white text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 delay-75 shadow-sm"
              onClick={(e) => { e.stopPropagation(); onDelete(property, e); }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          
          {/* Isometric Building Visualization */}
          <div className="absolute inset-0 flex items-center justify-center translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <div className="w-32 h-32 relative group-hover:scale-110 transition-transform duration-500 ease-out">
              <IsometricBuilding color={theme} className="w-full h-full drop-shadow-2xl" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={cn(
              "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-md",
              occupancyRate === 100 ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" :
              occupancyRate > 0 ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" :
              "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
            )}>
              {occupancyRate === 100 ? 'Completo' : occupancyRate === 0 ? 'Vacío' : 'Parcial'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-2 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {property.address}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {property.city || 'Ubicación no especificada'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> Ocupación
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {propTenants.length}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  / {property.totalRooms}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Ingresos
              </span>
              <span className={cn(
                "text-lg font-bold",
                monthlyIncome > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
              )}>
                ${monthlyIncome.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {/* Occupancy Bar */}
          <div className="mt-2 pt-2">
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${occupancyRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  occupancyRate >= 80 ? "bg-emerald-500" :
                  occupancyRate >= 50 ? "bg-blue-500" : 
                  occupancyRate > 0 ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
