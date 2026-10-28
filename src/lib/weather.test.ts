import { describe, expect, it } from "vitest";
import { look, parse, wxIcon, wxName } from "./weather";

describe("parse", () => {
  it("현재 기온·날씨 코드·운량을 꺼내고, 값이 비면 null이에요", () => {
    expect(parse({ current: { temperature_2m: 11.4, weather_code: 3, cloud_cover: 90 } })).toEqual({ temp: 11.4, code: 3, cloud: 90 });
    expect(parse({ current: { temperature_2m: null, weather_code: 0, cloud_cover: 0 } })).toBeNull();
    expect(parse(null)).toBeNull();
  });
});

describe("wxName", () => {
  it("WMO 코드를 우리말로 바꿔요", () => {
    expect(wxName(0)).toBe("맑음");
    expect(wxName(3)).toBe("흐림");
    expect(wxName(63)).toBe("비");
    expect(wxName(95)).toBe("뇌우");
  });

  it("코드에 맞는 아이콘을 골라요", () => {
    expect(wxIcon(0)).toContain("ph/sun-light.svg");
    expect(wxIcon(63)).toContain("ph/cloud-rain-light.svg");
  });
});

describe("look", () => {
  it("비가 오면 먹구름과 빗줄기, 맑으면 구름이 적어요", () => {
    expect(look({ temp: 10, code: 61, cloud: 100 })).toEqual({ cover: 1, dark: 1, rain: 1 });
    expect(look({ temp: 10, code: 0, cloud: 0 })).toEqual({ cover: 0.25, dark: 0, rain: 0 });
  });
});
