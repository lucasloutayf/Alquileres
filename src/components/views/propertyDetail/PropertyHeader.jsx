import { ArrowLeft, DollarSign, Home, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StatCard3D from '../../common/StatCard3D';
import Button from '../../common/Button';

const PropertyHeader = ({ property, totalMonthlyIncome, vacantRooms, totalExpensesAmount }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
            {property.address}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard3D
          title={t('propertyDetail.potentialIncome')}
          value={`$${totalMonthlyIncome.toLocaleString('es-AR')}`}
          icon={<DollarSign />}
          colorClass="green"
        />
        <StatCard3D
          title={t('propertyDetail.vacantRooms')}
          value={vacantRooms}
          icon={<Home />}
          colorClass="blue"
        />
        <StatCard3D
          title={t('propertyDetail.totalExpenses')}
          value={`$${totalExpensesAmount.toLocaleString('es-AR')}`}
          icon={<TrendingDown />}
          colorClass="red"
        />
      </div>
    </>
  );
};

export default PropertyHeader;
