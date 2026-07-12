import { useMemo } from "react";
import type { Game } from "#/domain/game";
import type { GameSearch } from "#/domain/query/search";
import { searchToFilter, filterToSearch } from "#/domain/query/search";
import type { GameFilter } from "#/domain/query/filter";
import { deriveOptions } from "#/domain/query/options";
import { partitionGames } from "#/domain/query/partition";
import { AppShell } from "#/app/AppShell";
import { StatsSummary } from "#/features/stats/StatsSummary";
import { ScheduledList } from "#/features/scheduled/ScheduledList";
import { Filters } from "#/features/filters/Filters";
import { YearFilter } from "#/features/filters/YearFilter";
import { CrossStats } from "#/features/stats/CrossStats";
import { GameTable } from "#/features/games/GameTable";

/**
 * ホーム画面の合成レイヤ（画面合成は screens/ の役割）。
 * ルーターに依存せず、URL 状態は search（読み）と onNavigate（書き）で受け渡す。
 * ルートとの結線は routes/index.tsx が担う。
 */
export function HomeView({
  games,
  allYears,
  search,
  onNavigate,
}: {
  games: Game[];
  allYears: string[];
  search: GameSearch;
  onNavigate: (search: GameSearch) => void;
}) {
  const options = useMemo(() => deriveOptions(games, allYears), [games, allYears]);
  const filter = useMemo(() => searchToFilter(search), [search]);

  const { attended, scheduled } = useMemo(() => partitionGames(games, filter), [games, filter]);

  const setFilter = (next: GameFilter) => onNavigate(filterToSearch(next));

  return (
    <AppShell>
      {scheduled.length > 0 && <ScheduledList games={scheduled} />}

      <YearFilter
        years={options.years}
        value={filter.year}
        onChange={(year) => setFilter({ ...filter, year })}
      />

      <StatsSummary games={attended} />

      <Filters filter={filter} options={options} onChange={setFilter} />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[var(--muted)]">
          観戦記録
          <span className="tnum ml-1.5 font-normal text-[var(--faint)]">{attended.length}件</span>
        </h2>
      </div>
      <GameTable games={attended} />

      <h2 className="mt-2 text-sm font-bold text-[var(--muted)]">軸別集計</h2>
      {/* 年度別は未フィルタ時のみ全年度（空白年含む）を明示。単一年に絞り込み中は文脈上不要。 */}
      <CrossStats games={attended} years={filter.year === "all" ? options.years : []} />
    </AppShell>
  );
}
