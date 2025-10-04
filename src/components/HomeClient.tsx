'use client';

import { useMemo, useState } from 'react';
import { YearData } from '@/types/game';

export default function HomeClient({ yearData }: { yearData: YearData }) {
  const years = useMemo(() => {
    return Object.keys(yearData)
      .map((y) => parseInt(y, 10))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => b - a)
      .map((n) => String(n));
  }, [yearData]);

  const [selectedYear, setSelectedYear] = useState<string>(() => years[0] ?? '');

  // games for the selected year (empty array if none)
  const selectedGames = (selectedYear && yearData[selectedYear]) || [];

  if (!years || years.length === 0) {
    return (
      <div className="min-h-screen bg-fs-altBackground p-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="text-fs-text text-6xl mb-4">⚾</div>
          <p className="text-fs-text text-lg font-medium">観戦記録がありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fs-altBackground px-1 sm:px-8 py-3 sm:py-8">
      <div className="max-w-full sm:max-w-6xl w-full mx-auto">
        {/* 年選択ドロップダウン */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-0">
          <h2 className="text-xl font-semibold text-fs-text">観戦履歴</h2>
          <div className="w-full sm:w-auto">
            <label htmlFor="year-select" className="sr-only">
              年を選択
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-fs-background border border-fs-header rounded-md px-2 py-1.5 text-sm text-fs-text shadow-sm focus:outline-none focus:ring-2 focus:ring-fs-header focus:border-fs-header w-full sm:w-auto"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}年
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 選択された年のデータ詳細 */}
        <section className="bg-fs-background rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-fs-text mb-4">
            🏟️ {selectedYear}年 ({selectedGames.length}試合)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-fs-header text-fs-text-invert font-bold">
                <tr>
                  <th className="px-1.5 py-1.5 sm:px-3 text-left font-bold">日付</th>
                  <th className="px-1.5 py-1.5 sm:px-3 text-left font-bold">対戦チーム</th>
                  <th className="px-1.5 py-1.5 sm:px-3 text-left font-bold">球場</th>
                  <th className="px-1.5 py-1.5 sm:px-3 text-center font-bold">勝敗</th>
                  <th className="px-1.5 py-1.5 sm:px-3 text-center font-bold">スコア</th>
                  <th className="px-1.5 py-1.5 sm:px-3 text-center font-bold">リンク</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fs-altBackground">
                {selectedGames.map((game, index) => (
                  <tr key={index}>
                    <td className="px-1.5 py-1.5 sm:px-3 text-fs-text">{game.date}</td>
                    <td className="px-1.5 py-1.5 sm:px-3 text-fs-text">{game.vsTeam}</td>
                    <td className="px-1.5 py-1.5 sm:px-3 text-fs-text">{game.location}</td>
                    <td className="px-1.5 py-1.5 sm:px-3 text-center">
                      <span className="text-base font-bold text-fs-text">
                        {game.result === 'win' ? '⭕' : game.result === 'lose' ? '❌' : '△'}
                      </span>
                    </td>
                    <td className="px-1.5 py-1.5 sm:px-3 text-center text-fs-text font-medium whitespace-nowrap">
                      <span className="whitespace-nowrap">
                        {game.score.my} - {game.score.vs}
                      </span>
                    </td>
                    <td className="px-1.5 py-1.5 sm:px-3 text-center">
                      <a
                        href={game.gameUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-fs-link underline hover:text-fs-text transition-colors duration-200"
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
      </div>
    </div>
  );
}
