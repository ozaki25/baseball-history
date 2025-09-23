'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameTable from '@/components/GameTable';
import StatsCards from '@/components/StatsCards';
import YearSelector from '@/components/YearSelector';
import { calculateStats, getAvailableYears, sortGamesByDate } from '@/lib/gameUtils';
import { YearData } from '@/types/game';

export default function HomeClient({ yearData }: { yearData: YearData }) {
  const availableYears = getAvailableYears(yearData);
  const [selectedYear, setSelectedYear] = useState(availableYears[0] || '2024');
  
  const currentGames = yearData[selectedYear] || [];
  const sortedGames = sortGamesByDate(currentGames);
  const stats = calculateStats(currentGames);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  return (
    <>
      <Header />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <section className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-fs-primary mb-4">
              観戦履歴管理
            </h2>
            <p className="text-gray-600 text-lg">
              北海道日本ハムファイターズの観戦記録を管理しましょう
            </p>
          </section>

          <StatsCards stats={stats} />

          <section className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h3 className="text-xl font-bold text-fs-primary">
                🏟️ {selectedYear}年 観戦履歴
              </h3>
              <YearSelector
                availableYears={availableYears}
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
              />
            </div>
            
            <GameTable games={sortedGames} selectedYear={selectedYear} />
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}