'use client';

import { YearData } from '@/types/game';

export default function HomeClient({ yearData }: { yearData: YearData }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            北海道日本ハムファイターズ 試合データ構造
          </h1>
          <p className="text-gray-600">ビルド時に取得された試合データの構造を表示しています</p>
        </header>

        <div className="grid gap-6">
          {/* データ概要 */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 データ概要</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(yearData).length}
                </div>
                <div className="text-sm text-gray-600">取得年数</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(yearData).reduce((sum, games) => sum + games.length, 0)}
                </div>
                <div className="text-sm text-gray-600">総試合数</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.values(yearData).reduce(
                    (sum, games) => sum + games.filter((g) => g.result === 'win').length,
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">勝利数</div>
              </div>
            </div>
          </section>

          {/* 年別データ詳細 */}
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

          {/* JSON構造表示 */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔍 データ構造 (JSON)</h2>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-xs">{JSON.stringify(yearData, null, 2)}</pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
