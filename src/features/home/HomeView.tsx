import { useMemo } from "react";
import type { Game } from "#/domain/game";
import type { GameSearch } from "#/features/filters/model/search";
import { searchToFilter, filterToSearch } from "#/features/filters/model/search";
import { deriveOptions, type GameFilter } from "#/features/filters/model/filters";
import { partitionGames } from "./model/derive";
import { StatsSummary } from "#/features/stats/StatsSummary";
import { ScheduledList } from "./ScheduledList";
import { Filters } from "#/features/filters/Filters";
import { YearFilter } from "#/features/filters/YearFilter";
import { CrossStats } from "#/features/stats/CrossStats";
import { GameTable } from "#/features/games/GameTable";
import { ThemeToggle } from "#/ui/ThemeToggle";

/**
 * メイン画面の本体（表示・絞り込みの結線）。ルーターに依存せず、
 * URL 状態は search（読み）と onNavigate（書き）で受け渡す純粋なコンポーネント。
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
    <div className="min-h-dvh">
      <header
        className="border-b"
        style={{ borderColor: "var(--line)", background: "var(--panel)" }}
      >
        <div className="h-1 w-full" style={{ background: "var(--brand)" }} aria-hidden />
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-bold tracking-tight">観戦ノート</h1>
            <p className="hidden text-xs text-[var(--muted)] sm:block">
              北海道日本ハムファイターズ 観戦記録
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 pb-20">
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
      </main>
    </div>
  );
}
