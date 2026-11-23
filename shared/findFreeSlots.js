// findFreeSlots.js
// Pure logic: no React, no Express, no file access.
// Times are minutes since midnight (9:30 = 570).
// Each busy item looks like: { userId: 1, day: "Mon", start: 540, end: 630, title: "Calculus" }

const DAY_START = 8 * 60;  // 08:00 = 480
const DAY_END = 18 * 60;   // 18:00 = 1080
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

/**
 * Merge overlapping or touching intervals into one.
 * Example: [540-630] and [600-700] become [540-700].
 */
function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged = [{ start: sorted[0].start, end: sorted[0].end }];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i].start <= last.end) {
      last.end = Math.max(last.end, sorted[i].end);
    } else {
      merged.push({ start: sorted[i].start, end: sorted[i].end });
    }
  }
  return merged;
}

/**
 * Find gaps between busy intervals inside the allowed window.
 */
function gapsBetween(busy, windowStart, windowEnd) {
  const gaps = [];
  let cursor = windowStart;

  for (const b of busy) {
    if (b.start > cursor) {
      gaps.push({ start: cursor, end: Math.min(b.start, windowEnd) });
    }
    cursor = Math.max(cursor, b.end);
    if (cursor >= windowEnd) break;
  }
  if (cursor < windowEnd) {
    gaps.push({ start: cursor, end: windowEnd });
  }
  return gaps.filter((g) => g.end > g.start);
}

/**
 * Main function.
 * @param {Array} timetables  all members' busy items (see top of file)
 * @param {number} duration   meeting length in minutes (e.g. 60)
 * @param {Object} options    { days, dayStart, dayEnd }
 * @returns {Array} [{ day, start, end }] where everyone is free
 */
function findFreeSlots(timetables, duration, options = {}) {
  const days = options.days || DAYS;
  const dayStart = options.dayStart ?? DAY_START;
  const dayEnd = options.dayEnd ?? DAY_END;
  const result = [];

  for (const day of days) {
    // Everyone's busy time on this day, combined (a group is busy if ANY member is busy)
    const busyToday = timetables
      .filter((t) => t.day === day)
      .map((t) => ({ start: t.start, end: t.end }));

    const merged = mergeIntervals(busyToday);
    const gaps = gapsBetween(merged, dayStart, dayEnd);

    for (const gap of gaps) {
      if (gap.end - gap.start >= duration) {
        result.push({ day, start: gap.start, end: gap.end });
      }
    }
  }
  return result;
}

/** Helper for display: 570 -> "09:30" */
function minutesToTime(m) {
  const h = String(Math.floor(m / 60)).padStart(2, "0");
  const min = String(m % 60).padStart(2, "0");
  return `${h}:${min}`;
}

module.exports = { findFreeSlots, mergeIntervals, minutesToTime };
