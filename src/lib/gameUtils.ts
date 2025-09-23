import { GameResult, GameStats, YearData } from '@/types/game';

export function calculateStats(games: GameResult[]): GameStats {
  const total = games.length;
  const wins = games.filter(game => game.result === 'win').length;
  const losses = games.filter(game => game.result === 'lose').length;
  const draws = games.filter(game => game.result === 'draw').length;
  const winRate = total > 0 ? Math.round((wins / total) * 100 * 10) / 10 : 0;

  return {
    total,
    wins,
    losses,
    draws,
    winRate
  };
}

export function formatDate(dateString: string): string {
  const month = dateString.substring(0, 2);
  const day = dateString.substring(2, 4);
  return `${parseInt(month)}/${parseInt(day)}`;
}

export function formatScore(fighters: number, opponent: number): string {
  return `${fighters} - ${opponent}`;
}

export function getResultColor(result: 'win' | 'lose' | 'draw'): string {
  switch (result) {
    case 'win':
      return 'text-result-win';
    case 'lose':
      return 'text-result-lose';
    case 'draw':
      return 'text-result-draw';
    default:
      return 'text-gray-500';
  }
}

export function getResultText(result: 'win' | 'lose' | 'draw'): string {
  switch (result) {
    case 'win':
      return '勝';
    case 'lose':
      return '負';
    case 'draw':
      return '分';
    default:
      return '-';
  }
}

export function sortGamesByDate(games: GameResult[]): GameResult[] {
  return games.sort((a, b) => {
    return parseInt(b.date) - parseInt(a.date);
  });
}

export function getAvailableYears(data: YearData): string[] {
  return Object.keys(data).sort((a, b) => parseInt(b) - parseInt(a));
}