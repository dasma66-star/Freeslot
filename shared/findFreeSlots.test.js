const { findFreeSlots, mergeIntervals } = require("./findFreeSlots");

describe("mergeIntervals", () => {
  it("merges overlapping intervals", () => {
    expect(mergeIntervals([{ start: 540, end: 630 }, { start: 600, end: 700 }]))
      .toEqual([{ start: 540, end: 700 }]);
  });
  it("keeps separate intervals apart", () => {
    expect(mergeIntervals([{ start: 540, end: 600 }, { start: 700, end: 760 }]))
      .toHaveLength(2);
  });
  it("returns empty for empty input", () => {
    expect(mergeIntervals([])).toEqual([]);
  });
});

describe("findFreeSlots", () => {
  const opts = { days: ["Mon"], dayStart: 480, dayEnd: 1080 };

  it("whole day is free when nobody has classes", () => {
    expect(findFreeSlots([], 60, opts)).toEqual([{ day: "Mon", start: 480, end: 1080 }]);
  });

  it("finds the gap between two members' classes", () => {
    const data = [
      { userId: 1, day: "Mon", start: 480, end: 600 },  // 08:00-10:00
      { userId: 2, day: "Mon", start: 720, end: 1080 }, // 12:00-18:00
    ];
    expect(findFreeSlots(data, 60, opts)).toEqual([{ day: "Mon", start: 600, end: 720 }]);
  });

  it("ignores gaps shorter than the meeting duration", () => {
    const data = [
      { userId: 1, day: "Mon", start: 480, end: 600 },
      { userId: 2, day: "Mon", start: 630, end: 1080 }, // only 30 min gap
    ];
    expect(findFreeSlots(data, 60, opts)).toEqual([]);
  });

  it("handles overlapping classes from different members", () => {
    const data = [
      { userId: 1, day: "Mon", start: 540, end: 660 },
      { userId: 2, day: "Mon", start: 600, end: 720 },
    ];
    const slots = findFreeSlots(data, 60, opts);
    expect(slots).toEqual([
      { day: "Mon", start: 480, end: 540 },
      { day: "Mon", start: 720, end: 1080 },
    ]);
  });

  it("only looks at the requested day", () => {
    const data = [{ userId: 1, day: "Tue", start: 480, end: 1080 }];
    expect(findFreeSlots(data, 60, opts)).toHaveLength(1);
  });
});
