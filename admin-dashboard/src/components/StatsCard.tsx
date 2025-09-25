
interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  iconColor: string;
}

export default function StatsCard({ title, value, change, icon, iconColor }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-gray-500 text-sm">{title}</p>
          <div className="flex items-baseline">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <span className="ml-2 text-sm font-medium text-green-500">{change}</span>
          </div>
        </div>
      </div>
    </div>
  );
}