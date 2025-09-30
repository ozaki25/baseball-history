import HomeClient from '@/components/HomeClient';
import { fetchGameData } from '@/lib/gameDataFetcher';
import { YearData } from '@/types/game';
import { loadAndValidateDatesAsDayjs } from '@/lib/datesLoader';

export default async function Home() {
  const datesByYear = loadAndValidateDatesAsDayjs();

  const yearData: YearData = {};

  for (const [year, dateArray] of Object.entries(datesByYear)) {
    yearData[year] = [];

    for (const dateObj of dateArray) {
      const mmdd = dateObj.format('MMDD');
      try {
        const gameData = await fetchGameData(year, mmdd);
        if (gameData) {
          yearData[year].push(gameData);
        } else {
          throw new Error(`Build failed: 試合データが取得できませんでした ${year}/${mmdd}`);
        }
      } catch (error) {
        // ビルド失敗は上位へ伝播
        throw error;
      }
    }
  }

  return <HomeClient yearData={yearData} />;
}
