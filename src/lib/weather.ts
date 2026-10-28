/** Open-Meteo 현재 날씨로 대구 하늘을 정해요. 키가 필요 없고 브라우저에서 바로 불러요. code는 WMO 날씨 코드예요. */
export type Now = { temp: number; code: number; cloud: number };
export type Look = { cover: number; dark: number; rain: number };

export const WX_URL = "https://api.open-meteo.com/v1/forecast?latitude=35.87&longitude=128.6&current=temperature_2m,weather_code,cloud_cover&timezone=Asia%2FSeoul";

export function parse(j: unknown): Now | null {
  const c = (j as { current?: Record<string, number | null> })?.current;
  if (c?.temperature_2m == null || c.weather_code == null || c.cloud_cover == null) return null;
  return { temp: c.temperature_2m, code: c.weather_code, cloud: c.cloud_cover };
}

// WMO 코드 구간의 상한, 이름, Iconify Phosphor Light 선 아이콘
const NAMES: [number, string, string][] = [
  [0, "맑음", "sun"], [2, "구름 조금", "cloud-sun"], [3, "흐림", "cloud"], [48, "안개", "cloud-fog"],
  [57, "이슬비", "cloud-rain"], [67, "비", "cloud-rain"], [77, "눈", "cloud-snow"],
  [82, "소나기", "cloud-rain"], [86, "눈", "cloud-snow"], [99, "뇌우", "cloud-lightning"],
];
const entry = (code: number) => NAMES.find(([max]) => code <= max);
export const wxName = (code: number) => entry(code)?.[1] ?? "";
export const wxIcon = (code: number) => `https://api.iconify.design/ph/${entry(code)?.[2] ?? "cloud"}-light.svg?color=%23ffffff`;
const wet = (code: number) => (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;

/** cover: 보일 구름 비율, dark: 먹구름 정도, rain: 빗줄기 */
// ponytail: 눈(71~77, 85~86)은 흐린 하늘로만 보여요. 눈송이가 필요하면 여기서 나누세요.
export function look({ code, cloud }: Now): Look {
  if (wet(code)) return { cover: 1, dark: 1, rain: 1 };
  const c = cloud / 100;
  return { cover: 0.25 + 0.75 * c, dark: Math.max(0, c - 0.6) * 1.4, rain: 0 };
}
