import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { HomeView } from "#/components/HomeView";
import type { Game } from "#/types/game";
import { makeGame } from "#/tests/helpers/makeGame";

// 固定フィクスチャ（live な games.json はingestで変わるため、baseline を安定させる目的で使わない）
const GAMES: Game[] = [
  makeGame({ id: "2026-06-14", date: "2026-06-14", opponent: "中日", result: "lose" }),
  makeGame({ id: "2026-06-13", date: "2026-06-13", opponent: "中日", result: "win" }),
  makeGame({
    id: "2025-09-28",
    date: "2025-09-28",
    opponent: "千葉ロッテ",
    stadium: "ZOZOマリン",
    homeAway: "away",
    result: "win",
    score: { fighters: 4, opponent: 3 },
  }),
  makeGame({
    id: "2025-05-03",
    date: "2025-05-03",
    opponent: "埼玉西武",
    stadium: "ベルーナドーム",
    homeAway: "away",
    result: "cancelled",
    score: { fighters: null, opponent: null },
  }),
  makeGame({
    id: "2026-08-10",
    date: "2026-08-10",
    opponent: "",
    stadium: "",
    result: "scheduled",
    homeAway: null,
    score: { fighters: null, opponent: null },
  }),
];
// 空白年(2024)を含む
const YEARS = ["2026", "2025", "2024", "2013"];

function renderHome(search = {}) {
  return render(
    <div data-testid="vrt-root">
      <HomeView games={GAMES} allYears={YEARS} search={search} onNavigate={() => {}} />
    </div>,
  );
}

test("トップ画面（モバイル 390px）", async () => {
  await page.viewport(390, 900);
  renderHome();
  await expect.element(page.getByTestId("vrt-root")).toMatchScreenshot("home-mobile");
});

test("トップ画面（デスクトップ 1280px）", async () => {
  await page.viewport(1280, 900);
  renderHome();
  await expect.element(page.getByTestId("vrt-root")).toMatchScreenshot("home-desktop");
});

// 絞り込みダイアログは tint チップ（複数選択UI）を含む唯一の画面。
// トップ画面のVRTでは撮れないため、開いた状態を別ケースで固定化する。
test("絞り込みダイアログ（tintチップ・モバイル 390px）", async () => {
  await page.viewport(390, 900);
  renderHome();
  await page.getByRole("button", { name: "絞り込み" }).click();
  await expect
    .element(page.getByRole("dialog", { name: "絞り込み条件" }))
    .toMatchScreenshot("filters-dialog-mobile");
});
