import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import type { GamesData, Game } from "#/types/game";
import gamesData from "../../data/games.json";
import { validateGameSearch, searchToFilter, filterToSearch } from "#/lib/search";
import { applyFilters, deriveOptions, type GameFilter } from "#/lib/filters";
import { StatsSummary } from "#/components/StatsSummary";
import { ScheduledList } from "#/components/ScheduledList";
import { Filters } from "#/components/Filters";
import { CrossStats } from "#/components/CrossStats";
import { GameTable } from "#/components/GameTable";
import { ThemeToggle } from "#/components/ThemeToggle";

export const Route = createFileRoute("/")({
  validateSearch: validateGameSearch,
  component: Home,
});

const ALL_GAMES: Game[] = (gamesData as GamesData).games;
const FILTER_OPTIONS = deriveOptions(ALL_GAMES);

function Home() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const filter = searchToFilter(search);

  const { attended, scheduled } = useMemo(() => {
    const current = searchToFilter(search);
    const filtered = applyFilters(ALL_GAMES, current);
    // 予定は結果未確定で相手/球場/主催が不定なため、年度だけで抽出して別枠表示する。
    const scheduledView = ALL_GAMES.filter(
      (g) =>
        g.result === "scheduled" && (current.year === "all" || g.date.slice(0, 4) === current.year),
    );
    return {
      attended: filtered.filter((g) => g.result !== "scheduled"),
      scheduled: scheduledView,
    };
  }, [search]);

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

        <StatsSummary games={attended} />

        <Filters filter={filter} options={FILTER_OPTIONS} onChange={setFilter} />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--muted)]">
            観戦記録
            <span className="tnum ml-1.5 font-normal text-[var(--faint)]">{attended.length}件</span>
          </h2>
        </div>
        <GameTable games={attended} />

        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-bold text-[var(--muted)]">
            軸別集計
          </summary>
          <div className="mt-2">
            <CrossStats games={attended} />
          </div>
        </details>
      </main>
    </div>
  );
}
