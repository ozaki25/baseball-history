'use client';

import { YearData } from '@/types/game';

export default function HomeClient({ yearData }: { yearData: YearData }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 年別データ詳細 */}
        <div className="space-y-6">
          {Object.entries(yearData).map(([year, games]) => (
            <section key={year} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🏟️ {year}年 ({games.length}試合)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">日付</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">対戦チーム</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">球場</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-700">勝敗</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-700">スコア</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-700">リンク</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {games.map((game, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-900">{game.date}</td>
                        <td className="px-3 py-2 text-gray-900">{game.vsTeam}</td>
                        <td className="px-3 py-2 text-gray-600">{game.location}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-base font-bold text-gray-800">
                            {game.result === 'win' ? '⭕' : game.result === 'lose' ? '❌' : '△'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center text-gray-900 font-medium">
                          {game.score.my} - {game.score.vs}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <a
                            href={game.gameUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
                          >
                            詳細
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
