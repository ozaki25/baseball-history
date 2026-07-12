import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ALL_GAMES, ALL_YEARS } from "#/data/games";
import { validateGameSearch } from "#/domain/query/search";
import { pickDefaultYear } from "#/domain/query/defaults";
import { HomeView } from "#/screens/home/HomeView";

export const Route = createFileRoute("/")({
  validateSearch: validateGameSearch,
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  // URL に year が無いときの既定年（＝今シーズン）。render 時に `new Date()` を評価するので、
  // 深夜 0 時をまたいで開き直したときも正しい「今年」に追従する。
  const defaultYear = pickDefaultYear(ALL_YEARS);
  return (
    <HomeView
      games={ALL_GAMES}
      allYears={ALL_YEARS}
      search={search}
      defaultYear={defaultYear}
      // フィルタ変更で履歴を積まない（戻る連打を防ぐ）
      onNavigate={(next) => void navigate({ search: next, replace: true })}
    />
  );
}
