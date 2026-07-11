import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import type { GamesData, Game, DatesData } from "#/types/game";
import gamesData from "../../data/games.json";
import datesData from "../../data/dates.json";
import { validateGameSearch, searchToFilter, filterToSearch } from "#/lib/search";
import { applyFilters, deriveOptions, type GameFilter } from "#/lib/filters";
import { StatsSummary } from "#/components/StatsSummary";
import { ScheduledList } from "#/components/ScheduledList";
import { Filters } from "#/components/Filters";
import { YearFilter } from "#/components/YearFilter";
import { CrossStats } from "#/components/CrossStats";
import { GameTable } from "#/components/GameTable";
import { ThemeToggle } from "#/components/ThemeToggle";

export const Route = createFileRoute("/")({
  validateSearch: validateGameSearch,
  component: Home,
});

const ALL_GAMES: Game[] = (gamesData as GamesData).games;
// dates.json の全年度（記録なしの空配列年を含む）を年度候補の源にする。
const ALL_YEARS: string[] = Object.keys(datesData as DatesData);
const FILTER_OPTIONS = deriveOptions(ALL_GAMES, ALL_YEARS);

function Home() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const filter = useMemo(() => searchToFilter(search), [search]);

  const { attended, scheduled } = useMemo(() => {
    const filtered = applyFilters(ALL_GAMES, filter);
    // 予定は結果未確定で相手/球場/主催が不定なため、年度だけで抽出して別枠表示する。
    const scheduledView = ALL_GAMES.filter(
      (g) =>
        g.result === "scheduled" && (filter.year === "all" || g.date.slice(0, 4) === filter.year),
    );
    return {
      attended: filtered.filter((g) => g.result !== "scheduled"),
      scheduled: scheduledView,
    };
  }, [filter]);

  const setFilter = (next: GameFilter) => {
    // フィルタ変更で履歴を積まない（戻る連打を防ぐ）
    void navigate({ search: filterToSearch(next), replace: true });
  };

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
          years={FILTER_OPTIONS.years}
          value={filter.year}
          onChange={(year) => setFilter({ ...filter, year })}
        />

        <StatsSummary games={attended} />

        <Filters filter={filter} options={FILTER_OPTIONS} onChange={setFilter} />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--muted)]">
            観戦記録
            <span className="tnum ml-1.5 font-normal text-[var(--faint)]">{attended.length}件</span>
          </h2>
        </div>
        <GameTable games={attended} />

        <h2 className="mt-2 text-sm font-bold text-[var(--muted)]">軸別集計</h2>
        {/* 年度別は未フィルタ時のみ全年度（空白年含む）を明示。単一年に絞り込み中は文脈上不要。 */}
        <CrossStats games={attended} years={filter.year === "all" ? FILTER_OPTIONS.years : []} />
      </main>
    </div>
  );
}
