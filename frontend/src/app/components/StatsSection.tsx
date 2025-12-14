interface Stat {
  value: string;
  label: string;
}

interface StatsSectionProps {
  stats: Stat[];
  className?: string;
}

export default function StatsSection({ stats, className = '' }: StatsSectionProps) {
  return (
    <div className={`grid md:grid-cols-${stats.length} gap-8 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
          <p className="text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
