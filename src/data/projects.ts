export type Category = "Web" | "Desktop" | "Android" | "All";
export type TechUsage = { skill: string; usage: string };

export type Project = {
  name: string;
  nameKo: string;
  year: string;
  solo: boolean;
  desc: string;
  tech: string[];
  techUsage: TechUsage[];
  category: Category;
  href: string;
  code: string | null;
  image: string | null;
  proposal?: string;
};

export const PROJECTS: Project[] = [
  {
    name: "daimon", nameKo: "다이몬", year: "2026", solo: true, category: "Web",
    desc: "외주 작업 자동차 카본 파츠 업체 프론트, 백 및 토스 결제까지 모두 구현",
    tech: ["Next.js","TypeScript","Tailwind CSS","Framer Motion","Supabase","Cloudflare","Swiper"],
    techUsage: [
      { skill: "Next.js",       usage: "App Router + Server Actions 기반 풀스택 구조" },
      { skill: "TypeScript",    usage: "전체 컴포넌트 및 API 응답 타입 정의" },
      { skill: "Tailwind CSS",  usage: "전체 UI 스타일링 및 반응형 레이아웃" },
      { skill: "Framer Motion", usage: "제품 카드·페이지 전환 애니메이션" },
      { skill: "Supabase",      usage: "상품 DB 및 주문 내역 저장·조회" },
      { skill: "Cloudflare",    usage: "Workers + Pages 배포 및 엣지 캐싱" },
      { skill: "Swiper",        usage: "제품 상세 이미지 슬라이더" },
    ],
    href: "https://adr-works.com", code: null, image: "/projects/daimon.png",
    proposal: "/proposals/daimon.md",
  },
  {
    name: "apple", nameKo: "애플", year: "2026", solo: true, category: "Web",
    desc: "Apple 제품 소개 클론. 스크롤 인터랙션과 반응형 레이아웃.",
    tech: ["React","TypeScript","Vite","Sass","React Router"],
    techUsage: [
      { skill: "React",        usage: "홈·스토어·서포트 페이지 컴포넌트 구성" },
      { skill: "TypeScript",   usage: "컴포넌트 props 및 data 배열 타입 정의" },
      { skill: "Vite",         usage: "빌드 도구 및 개발 서버, path alias 설정" },
      { skill: "Sass",         usage: "컴포넌트별 모듈 스타일(변수·믹스인), Reveal 애니메이션" },
      { skill: "React Router", usage: "BrowserRouter로 /iphone, /support 등 다중 페이지 라우팅" },
    ],
    href: "http://103.218.172.76:1004", code: "#", image: "/projects/apple.png",
  },
  {
    name: "genesis", nameKo: "제네시스", year: "2026", solo: true, category: "Web",
    desc: "GSAP 애니메이션, Swiper 슬라이더, shadcn/ui 컴포넌트.",
    tech: ["Next.js","TypeScript","Tailwind CSS","GSAP","Swiper"],
    techUsage: [
      { skill: "Next.js",      usage: "App Router 기반 페이지·레이아웃, Next Image 최적화" },
      { skill: "TypeScript",   usage: "컴포넌트 props 및 locale 데이터 타입 정의" },
      { skill: "Tailwind CSS", usage: "전체 레이아웃·컬러·타이포그래피 유틸리티" },
      { skill: "GSAP",         usage: "ScrollTrigger — 섹션 스크롤 진입 시 fade/rise 애니메이션" },
      { skill: "Swiper",       usage: "메인 히어로 슬라이더, 부티크·이벤트·카드 캐러셀" },
    ],
    href: "http://103.218.172.76:6102", code: "#", image: "/projects/genesis.png",
  },
  {
    name: "airport-typing", nameKo: "에어포트 타이핑", year: "2026", solo: true, category: "Web",
    desc: "세계 주요 국제공항을 타이핑하며 익히는 인터랙티브 학습 게임.",
    tech: ["React","Vite","GSAP","Sass"],
    techUsage: [
      { skill: "React",  usage: "6개 뷰(홈·설정·게임·결과·랭크·컬렉션) 상태 관리 및 전환" },
      { skill: "Vite",   usage: "빌드·개발 서버, @js path alias로 게임 엔진 모듈 분리" },
      { skill: "GSAP",   usage: "SVG 세계지도 카메라 줌·팬, 비행 경로·항공기 이동 애니메이션" },
      { skill: "Sass",   usage: "전역 변수·리셋, 뷰별 스타일(게임 HUD, 홈, 오버레이 패널)" },
    ],
    href: "http://103.218.172.76:3000", code: "#", image: "/projects/airport-typing.png",
  },
  {
    name: "youtube-music", nameKo: "유튜브 뮤직", year: "2026", solo: true, category: "Desktop",
    desc: "유튜브 뮤직을 데스크톱에서 재생하는 앱.",
    tech: [], techUsage: [], href: "#", code: "#", image: null,
  },
];
