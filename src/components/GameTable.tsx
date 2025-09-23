import { GameResult } from '@/types/game';
import { formatDate, formatScore, getResultColor, getResultText } from '@/lib/gameUtils';

interface GameTableProps {
  games: GameResult[];
  className?: string;
}

export default function GameTable({ games, className = '' }: GameTableProps) {
  if (!games || games.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-fs-gray-400 text-6xl mb-4">⚾</div>
        <p className="text-fs-gray-600 text-lg font-medium">観戦記録がありません</p>
        <p className="text-fs-gray-500 text-sm mt-2">
          試合を観戦したら記録を追加しましょう
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* デスクトップ版テーブル */}
      <div className="hidden md:block overflow-x-auto">
        <table 
          className="w-full bg-fs-white border border-fs-gray-200 rounded-lg shadow-sm"
          aria-label="観戦履歴一覧"
        >
          <thead>
            <tr className="bg-fs-blue-50 border-b border-fs-blue-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-fs-primary" scope="col">
                日程
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-fs-primary" scope="col">
                対戦相手
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-fs-primary" scope="col">
                結果
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-fs-primary" scope="col">
                スコア
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-fs-primary" scope="col">
                球場
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-fs-primary" scope="col">
                メモ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fs-gray-200">
            {games.map((game, index) => (
              <tr 
                key={`${game.date}-${index}`}
                className="hover:bg-fs-gray-50 transition-colors duration-200"
              >
                <td className="px-4 py-3 text-sm text-fs-gray-900">{formatDate(game.date)}</td>
                <td className="px-4 py-3 text-sm font-medium text-fs-gray-900">vs {game.opponent}</td>
                <td className="px-4 py-3 text-center">
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultColor(game.result)} bg-opacity-10`}
                  >
                    {getResultText(game.result)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-fs-gray-900">
                  {game.score ? formatScore(game.score.fighters, game.score.opponent) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-fs-gray-600">
                  <span className="truncate block max-w-32">{game.location || '-'}</span>
                </td>
                <td className="px-4 py-3 text-sm text-fs-gray-600">
                  <span className="truncate block max-w-40">{game.notes || '-'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* モバイル版カードレイアウト */}
      <div className="md:hidden space-y-4">
        {games.map((game, index) => (
          <div 
            key={`${game.date}-${index}`}
            className="bg-fs-white border border-fs-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-medium text-fs-gray-900">
                  {formatDate(game.date)}
                </p>
                <p className="text-lg font-bold text-fs-primary">
                  vs {game.opponent}
                </p>
              </div>
              <div className="text-right">
                <span 
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getResultColor(game.result)} bg-opacity-10`}
                >
                  {getResultText(game.result)}
                </span>
                {game.score && (
                  <p className="text-sm text-fs-gray-600 mt-1">
                    {formatScore(game.score.fighters, game.score.opponent)}
                  </p>
                )}
              </div>
            </div>
            
            {(game.location || game.notes) && (
              <div className="pt-3 border-t border-fs-gray-100 space-y-1">
                {game.location && (
                  <p className="text-xs text-fs-gray-600">
                    <span className="font-medium">球場:</span> {game.location}
                  </p>
                )}
                {game.notes && (
                  <p className="text-xs text-fs-gray-600">
                    <span className="font-medium">メモ:</span> {game.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
