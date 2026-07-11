import { describe, it, expect } from "vitest";
import type { Game } from "#/types/game";
import {
  formatDateJa,
  formatScore,
  gameSourceUrl,
  RESULT_LABEL,
  HOME_AWAY_LABEL,
} from "#/lib/labels";

function game(score: Game["score"]): Game {
  return {
    id: "x",
    date: "2025-04-01",
    opponent: "オリックス",
    opponentId: "orix",
    stadium: "エスコンフィールド",
    stadiumId: "escon",
    homeAway: "home",
    result: "win",
    score,
  };
}

describe("formatDateJa", () => {
  it("曜日つきで整形する", () => {
    expect(formatDateJa("2026-06-13")).toBe("2026.6.13(土)");
    expect(formatDateJa("2026-06-14")).toBe("2026.6.14(日)");
  });
  it("月日はゼロ埋めしない", () => {
    expect(formatDateJa("2025-04-01")).toBe("2025.4.1(火)");
  });
});

describe("formatScore", () => {
  it("スコアあり", () => {
    expect(formatScore(game({ fighters: 5, opponent: 3 }))).toBe("5 - 3");
  });
  it("中止・予定など null は —", () => {
    expect(formatScore(game({ fighters: null, opponent: null }))).toBe("—");
  });
});

describe("gameSourceUrl", () => {
  it("日付から公式サイトの試合結果URLを復元（第1試合）", () => {
    expect(gameSourceUrl("2006-06-02")).toBe(
      "https://www.fighters.co.jp/gamelive/result/2006060201/",
    );
    expect(gameSourceUrl("2025-10-04")).toBe(
      "https://www.fighters.co.jp/gamelive/result/2025100401/",
    );
  });
});

describe("ラベル", () => {
  it("結果ラベル", () => {
    expect(RESULT_LABEL.win).toBe("勝");
    expect(RESULT_LABEL.cancelled).toBe("中止");
    expect(RESULT_LABEL.scheduled).toBe("予定");
    expect(RESULT_LABEL.unknown).toBe("詳細不明");
  });
  it("主催/ビジター", () => {
    expect(HOME_AWAY_LABEL.home).toBe("主催");
    expect(HOME_AWAY_LABEL.away).toBe("ビジター");
  });
});
