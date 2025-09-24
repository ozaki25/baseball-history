import HomeClient from '@/components/HomeClient';
import { fetchGameData } from '@/lib/gameDataFetcher';
import { DatesData, YearData } from '@/types/game';
import datesData from '../../data/dates.json';

export default async function Home() {
  const dates: DatesData = datesData as DatesData;

  const yearData: YearData = {};

  for (const [year, dateArray] of Object.entries(dates)) {
    yearData[year] = [];

    for (const date of dateArray) {
      try {
        const gameData = await fetchGameData(year, date);
        if (gameData) {
          yearData[year].push(gameData);
        } else {
          throw new Error(`Build failed: 試合データが取得できませんでした ${year}/${date}`);
        }
      } catch (error) {
        console.error(`❌ ビルド失敗: ${year}/${date}`, error);
        throw error;
      }
    }
  }

  return <HomeClient yearData={yearData} />;
}
