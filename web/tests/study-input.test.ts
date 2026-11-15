import { describe, expect, it } from "vitest";

import { parseStudyDate, parseStudyInput, parseStudyPoint, scopedStudyPair } from "@/lib/study-input";

describe("parseStudyPoint", () => {
  it.each(["", "lat=10", "lon=-85", "fecha=2026-11-15"])("marks missing coordinates: %s", (query) => {
    expect(parseStudyPoint(new URLSearchParams(query))).toEqual({ status: "missing" });
  });

  it.each(["lat=&lon=", "lat=++&lon=-85", "lat=NaN&lon=-85", "lat=0x10&lon=-85", "lat=999&lon=-85", "lat=0&lon=181"])(
    "rejects empty or out-of-range coordinates: %s", (query) => {
      expect(parseStudyPoint(new URLSearchParams(query))).toEqual({ status: "invalid" });
    },
  );

  it.each([["0", "0"], ["-90", "-180"], ["90", "180"], [" 10.635 ", " -85.4377 "]])(
    "accepts finite coordinates including bounds and zero: %s, %s", (lat, lon) => {
      expect(parseStudyPoint(new URLSearchParams({ lat, lon }))).toEqual({
        status: "valid", point: { lat: Number(lat), lon: Number(lon) },
      });
    },
  );
});

describe("parseStudyDate", () => {
  it("allows an absent date", () => {
    expect(parseStudyDate(null)).toEqual({ status: "valid", date: null });
    expect(parseStudyDate(undefined)).toEqual({ status: "valid", date: null });
  });

  it.each(["", " ", "no-fecha", "2026-2-01", "2026-02-31", "2026-02-29", "2026-04-31", "2026-13-01", "2026-01-00", "2026-11-15T00:00:00Z"])(
    "rejects malformed or impossible calendar dates: %s", (fecha) => {
      expect(parseStudyDate(fecha)).toEqual({ status: "invalid" });
    },
  );

  it.each(["2024-02-29", "2026-11-15", "2000-02-29"])("accepts real ISO calendar dates: %s", (fecha) => {
    expect(parseStudyDate(fecha)).toEqual({ status: "valid", date: fecha });
  });
});

describe("study query validation", () => {
  it.each(["", "lat=10", "lon=-85"])("requires both coordinates: %s", (query) => {
    expect(parseStudyInput(new URLSearchParams(query))).toEqual({ status: "missing", field: "coordinates" });
  });

  it.each([
    "lat=&lon=", "lat=+&lon=-85", "lat=NaN&lon=-85", "lat=Infinity&lon=-85",
    "lat=999&lon=999", "lat=-90.1&lon=0", "lat=0&lon=180.1",
    "lat=10x&lon=-85", "lat=0x10&lon=-85", "lat=1e999&lon=0",
  ])("rejects invalid coordinates: %s", (query) => {
    expect(parseStudyInput(new URLSearchParams(query))).toEqual({ status: "invalid", field: "coordinates" });
  });

  it.each([
    ["0", "0"], ["90", "180"], ["-90", "-180"], [" 10.635 ", " -85.4377 "],
  ])("accepts finite coordinates including bounds and zero: %s, %s", (lat, lon) => {
    expect(parseStudyInput(new URLSearchParams({ lat, lon }))).toEqual({
      status: "valid", point: { lat: Number(lat), lon: Number(lon) }, eventDate: null,
    });
  });

  it.each(["", "bad", "2026-2-01", "2026-02-29", "2026-02-30", "2026-04-31", "2026-13-01", "2026-00-01", "2026-01-00", "2026-11-15T00:00:00Z"])(
    "rejects malformed or impossible calendar dates: %s", (fecha) => {
      expect(parseStudyInput(new URLSearchParams({ lat: "10", lon: "-85", fecha }))).toEqual({ status: "invalid", field: "date" });
    },
  );

  it.each(["2024-02-29", "2026-11-15", "2000-02-29"])("accepts real ISO calendar dates: %s", (fecha) => {
    expect(parseStudyInput(new URLSearchParams({ lat: "10", lon: "-85", fecha }))).toEqual({
      status: "valid", point: { lat: 10, lon: -85 }, eventDate: fecha,
    });
  });
});

describe("source-scoped image selection", () => {
  const selection = { sourceKey: "palo-verde", before: 1, after: 3 };
  it("keeps a valid selection for the same source", () => {
    expect(scopedStudyPair(selection, "palo-verde", 5)).toEqual({ before: 1, after: 3 });
  });
  it("drops indexes when the query/source changes", () => {
    expect(scopedStudyPair(selection, "cano-negro", 5)).toBeNull();
  });
  it("drops out-of-range, reversed and non-integer indexes", () => {
    expect(scopedStudyPair(selection, "palo-verde", 3)).toBeNull();
    expect(scopedStudyPair({ ...selection, before: 3 }, "palo-verde", 5)).toBeNull();
    expect(scopedStudyPair({ ...selection, before: -1 }, "palo-verde", 5)).toBeNull();
    expect(scopedStudyPair({ ...selection, after: 3.5 }, "palo-verde", 5)).toBeNull();
  });
});
