import { TrendingUp, TrendingDown, DollarSign, Car, Users, PieChart } from 'lucide-react';
import { DashboardStats as DashboardStatsType } from '../../types';

interface Props {
  stats: DashboardStatsType;
  isLoading?: boolean;
}

export default function DashboardStats({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Vehicles',
      value: stats.totalVehicles,
      subtitle: `${stats.activeVehicles} active`,
      icon: Car,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Weekly Revenue',
      value: `R${stats.weeklyRevenue.toLocaleString('en-ZA')}`,
      subtitle: 'This week',
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Weekly Profit',
      value: `R${stats.weeklyProfit.toLocaleString('en-ZA')}`,
      subtitle: `${stats.averageProfitMargin.toFixed(1)}% margin`,
      icon: stats.weeklyProfit >= 0 ? TrendingUp : TrendingDown,
      color: stats.weeklyProfit >= 0 ? 'emerald' : 'red',
      bgColor: stats.weeklyProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      iconColor: stats.weeklyProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
    },
    {
      title: 'Avg. Profit Margin',
      value: `${stats.averageProfitMargin.toFixed(1)}%`,
      subtitle: 'Fleet average',
      icon: PieChart,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
