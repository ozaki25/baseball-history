import { GameStats } from '@/types/game';

interface StatsCardsProps {
  stats: GameStats;
  className?: string;
}

export default function StatsCards({ stats, className = '' }: StatsCardsProps) {
  return (
    <section className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${className}`} aria-label="観戦統計">
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
        <h4 className="text-lg font-semibold text-fs-primary mb-2">総観戦数</h4>
        <p className="text-3xl font-bold text-gray-900" aria-label={`総観戦数 ${stats.total} 試合`}>
          {stats.total}
        </p>
        <p className="text-sm text-gray-500 mt-1">試合</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">勝利数</h4>
        <p className="text-3xl font-bold text-gray-900" aria-label={`勝利数 ${stats.wins} 試合`}>
          {stats.wins}
        </p>
        <p className="text-sm text-gray-500 mt-1">勝</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">敗戦数</h4>
        <p className="text-3xl font-bold text-gray-900" aria-label={`敗戦数 ${stats.losses} 試合`}>
          {stats.losses}
        </p>
        <p className="text-sm text-gray-500 mt-1">敗</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
        <h4 className="text-lg font-semibold text-fs-primary mb-2">勝率</h4>
        <p
          className="text-3xl font-bold text-fs-primary"
          aria-label={`勝率 ${stats.winRate} パーセント`}
        >
          {stats.winRate}%
        </p>
        <p className="text-sm text-gray-500 mt-1">{stats.draws > 0 && `引分 ${stats.draws}`}</p>
      </div>
    </section>
  );
}
