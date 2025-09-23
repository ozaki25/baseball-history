import { GameResult } from '@/types/game';
import { formatDate, formatScore, getResultColor, getResultText } from '@/lib/gameUtils';

interface GameTableProps {
  games: GameResult[];
  className?: string;
}

export default function GameTable({ games, className = '' }: GameTableProps) {
  if (!games || games.length === 0) {
    return (
      <div className={`text-center py-8 text-fs-gray-500 ${className}`}>
        <p>観戦履歴がありません</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table 
        className="min-w-full bg-fs-white border border-fs-gray-200 rounded-lg shadow-sm"
        role="table"
        aria-label="観戦履歴テーブル"
      >
        <thead className="bg-fs-blue-50">
          <tr>
            <th 
              scope="col"
              className="px-4 py-3 text-left text-sm font-semibold text-fs-primary border-b border-fs-gray-200"
            >
              日付
            </th>
            <th 
              scope="col"
              className="px-4 py-3 text-left text-sm font-semibold text-fs-primary border-b border-fs-gray-200"
            >
              対戦相手
            </th>
            <th 
              scope="col"
              className="px-4 py-3 text-center text-sm font-semibold text-fs-primary border-b border-fs-gray-200"
            >
              結果
            </th>
            <th 
              scope="col"
              className="px-4 py-3 text-center text-sm font-semibold text-fs-primary border-b border-fs-gray-200"
            >
              スコア
            </th>
            <th 
              scope="col"
              className="px-4 py-3 text-left text-sm font-semibold text-fs-primary border-b border-fs-gray-200"
            >
              球場
            </th>
            <th 
              scope="col"
              className="px-4 py-3 text-left text-sm font-semibold text-fs-primary border-b border-fs-gray-200"
            >
              メモ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-fs-gray-200">
          {games.map((game, index) => (
            <tr
              key={`${game.date}-${game.opponent}-${index}`}
              className="hover:bg-fs-gray-50 focus-within:bg-fs-gray-50 transition-colors duration-150"
              tabIndex={-1}
            >
              <td className="px-4 py-3 text-sm text-fs-gray-900">
                <time dateTime={`2024-${game.date.substring(0, 2)}-${game.date.substring(2, 4)}`}>
                  {formatDate(game.date)}
                </time>
              </td>
              <td className="px-4 py-3 text-sm text-fs-gray-900 font-medium">
                {game.opponent}
              </td>
              <td className="px-4 py-3 text-center">
                <span 
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getResultColor(game.result)} bg-opacity-10`}
                  aria-label={`試合結果: ${getResultText(game.result)}`}
                >
                  {getResultText(game.result)}
                </span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-fs-gray-900">
                {game.score ? formatScore(game.score.fighters, game.score.opponent) : '-'}
              </td>
              <td className="px-4 py-3 text-sm text-fs-gray-600">
                {game.location || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-fs-gray-600 max-w-xs truncate">
                {game.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}