import { describe, it, expect } from "vitest";
import type { Game } from "@/types/game";
import { mergeIngest } from "@/lib/ingestCore";
import { loadTestHTML, TEST_PATTERNS } from "@/tests/helpers/testHtmlLoader";

const NOW = new Date("2026-07-11T00:00:00Z");
const HOME_WIN = loadTestHTML(TEST_PATTERNS.HOME_WIN); // 千葉ロッテ 5-1 勝

function makeFetch(map: Record<string, string | Error>) {
  const calls: string[] = [];
  const fetchHtml = async (year: string, mmdd: string) => {
    calls.push(`${year}${mmdd}`);
    const v = map[`${year}${mmdd}`];
    if (v === undefined) throw new Error("HTTP 404");
    if (v instanceof Error) throw v;
    return v;
  };
  return { fetchHtml, calls };
}

function confirmed(id: string, extra: Partial<Game> = {}): Game {
  return {
    id,
    date: id,
    opponent: "埼玉西武",
    opponentId: "OLD", // 古い/誤ったID（再解決されるか確認用）
    stadium: "西武ドーム",
    stadiumId: "OLD",
    homeAway: "away",
    result: "lose",
    score: { fighters: 3, opponent: 5 },
    ...extra,
  };
}

describe("mergeIngest", () => {
  it("未来日は fetch せず scheduled にする", async () => {
    const { fetchHtml, calls } = makeFetch({});
    const r = await mergeIngest({ "2030": ["0101"] }, new Map(), {
      fetchHtml,
      now: NOW,
    });
    expect(calls).toEqual([]);
    expect(r.games[0]!.result).toBe("scheduled");
    expect(r.fetched).toBe(0);
  });

  it("過去日は取得・解析して確定する", async () => {
    const { fetchHtml } = makeFetch({ "20250401": HOME_WIN });
    const r = await mergeIngest({ "2025": ["0401"] }, new Map(), {
      fetchHtml,
      now: NOW,
    });
    expect(r.games[0]).toMatchObject({
      result: "win",
      opponent: "千葉ロッテ",
      opponentId: "lotte",
    });
    expect(r.fetched).toBe(1);
  });

  it("確定済みは再取得せず、IDだけ現行マスタで再解決する", async () => {
    const { fetchHtml, calls } = makeFetch({ "20130807": HOME_WIN });
    const existing = new Map([["2013-08-07", confirmed("2013-08-07")]]);
    const r = await mergeIngest({ "2013": ["0807"] }, existing, {
      fetchHtml,
      now: NOW,
    });
    expect(calls).toEqual([]); // fetch されない
    expect(r.games[0]).toMatchObject({
      result: "lose",
      opponentId: "seibu",
      stadiumId: "seibu-dome",
    });
  });

  it("--force なら確定済みも再取得する", async () => {
    const { fetchHtml, calls } = makeFetch({ "20130807": HOME_WIN });
    const existing = new Map([["2013-08-07", confirmed("2013-08-07")]]);
    const r = await mergeIngest({ "2013": ["0807"] }, existing, {
      fetchHtml,
      now: NOW,
      force: true,
    });
    expect(calls).toEqual(["20130807"]);
    expect(r.games[0]!.opponent).toBe("千葉ロッテ"); // 取得結果で上書き
  });

  it("取得失敗時は既存レコードを保持する（データ消失防止）", async () => {
    // scheduled は未確定なので再取得対象。fetch 失敗 → 既存を保持
    const stale = { ...confirmed("2025-05-01"), result: "scheduled" as const };
    const { fetchHtml } = makeFetch({ "20250501": new Error("network") });
    const existing = new Map([["2025-05-01", stale]]);
    const r = await mergeIngest({ "2025": ["0501"] }, existing, {
      fetchHtml,
      now: NOW,
    });
    expect(r.failures).toHaveLength(1);
    expect(r.games.map((g) => g.id)).toContain("2025-05-01"); // 消えていない
  });

  it("取得失敗かつ既存なしは、消失ではなく失敗記録のみ", async () => {
    const { fetchHtml } = makeFetch({ "20250501": new Error("network") });
    const r = await mergeIngest({ "2025": ["0501"] }, new Map(), {
      fetchHtml,
      now: NOW,
    });
    expect(r.games).toHaveLength(0);
    expect(r.failures).toHaveLength(1);
  });

  it("解析不能でも中止表記なら cancelled として保存", async () => {
    const { fetchHtml } = makeFetch({ "20250601": "<div>本日の試合は中止となりました</div>" });
    const r = await mergeIngest({ "2025": ["0601"] }, new Map(), {
      fetchHtml,
      now: NOW,
    });
    expect(r.games[0]!.result).toBe("cancelled");
  });

  it("--year 指定時、対象外の年は既存を維持しfetchしない", async () => {
    const { fetchHtml, calls } = makeFetch({ "20250401": HOME_WIN });
    const existing = new Map([["2024-04-05", confirmed("2024-04-05")]]);
    const r = await mergeIngest({ "2024": ["0405"], "2025": ["0401"] }, existing, {
      fetchHtml,
      now: NOW,
      yearFilter: "2025",
    });
    expect(calls).toEqual(["20250401"]); // 2024はfetchされない
    // mergeIngest は date 昇順で返す（呼び出し側でソートしない）
    expect(r.games.map((g) => g.id)).toEqual(["2024-04-05", "2025-04-01"]);
  });

  it("既存の cancelled は再取得し、結果が出れば確定へ自己修復する", async () => {
    const existing = new Map([
      ["2025-06-01", { ...confirmed("2025-06-01"), result: "cancelled" as const }],
    ]);
    const { fetchHtml, calls } = makeFetch({ "20250601": HOME_WIN });
    const r = await mergeIngest({ "2025": ["0601"] }, existing, { fetchHtml, now: NOW });
    expect(calls).toEqual(["20250601"]); // cancelled は確定扱いしないので再取得
    expect(r.games[0]).toMatchObject({ result: "win", opponent: "千葉ロッテ" });
  });
});
