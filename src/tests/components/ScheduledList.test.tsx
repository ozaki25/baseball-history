// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScheduledList } from "#/features/home/ScheduledList";
import { makeGame } from "#/tests/helpers/makeGame";

describe("ScheduledList", () => {
  it("予定が無ければ何も描画しない（抽出は呼び出し側の責務）", () => {
    const { container } = render(<ScheduledList games={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("受け取った予定を日付昇順で並べる", () => {
    render(
      <ScheduledList
        games={[
          makeGame({ id: "2026-08-10", date: "2026-08-10", result: "scheduled", opponent: "巨人" }),
          makeGame({ id: "2026-07-20", date: "2026-07-20", result: "scheduled", opponent: "阪神" }),
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("2026.7.20");
    expect(items[0]).toHaveTextContent("vs 阪神");
    expect(items[1]).toHaveTextContent("2026.8.10");
  });

  it("対戦相手が未定(空)なら「対戦相手未定」を表示", () => {
    render(
      <ScheduledList
        games={[
          makeGame({ id: "2026-09-01", date: "2026-09-01", result: "scheduled", opponent: "" }),
        ]}
      />,
    );
    expect(screen.getByText("対戦相手未定")).toBeInTheDocument();
  });
});
