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
    desc: "[외주 작업] 자동차 카본 파츠 업체의 웹사이트, 제품 정보, 결제까지 모두 만들었어요.",
    tech: ["Next.js","TypeScript","Tailwind CSS","Framer Motion","Supabase","Cloudflare","Swiper"],
    techUsage: [
      { skill: "Next.js",       usage: "App Router와 Server Actions로 풀스택 구조를 잡았어요." },
      { skill: "TypeScript",    usage: "컴포넌트와 API 응답 타입을 정의했어요." },
      { skill: "Tailwind CSS",  usage: "전체 UI와 반응형 레이아웃을 잡았어요." },
      { skill: "Framer Motion", usage: "제품 카드와 페이지 전환에 애니메이션을 넣었어요." },
      { skill: "Supabase",      usage: "상품과 주문 내역을 저장하고 조회해요." },
      { skill: "Cloudflare",    usage: "Workers와 Pages로 배포하고 엣지에서 캐시해요." },
      { skill: "Swiper",        usage: "제품 상세 이미지를 슬라이더로 넘겨요." },
    ],
    href: "https://adr-works.com", code: null, image: "/projects/daimon.png",
    proposal: "/proposals/daimon.md",
  },
  {
    name: "apple", nameKo: "애플", year: "2026", solo: true, category: "Web",
    desc: "[클론 작업] Apple 웹페이지의 반응형 레이아웃과 인터랙션을 구현했어요.",
    tech: ["React","TypeScript","Vite","Sass","React Router"],
    techUsage: [
      { skill: "React",        usage: "홈, 스토어, 서포트 페이지를 컴포넌트로 구성했어요." },
      { skill: "TypeScript",   usage: "컴포넌트 props와 데이터 배열 타입을 정의했어요." },
      { skill: "Vite",         usage: "개발 서버와 빌드, path alias를 설정했어요." },
      { skill: "Sass",         usage: "컴포넌트별 스타일과 Reveal 애니메이션을 작성했어요." },
      { skill: "React Router", usage: "/iphone, /support 같은 페이지를 라우팅해요." },
    ],
    href: "http://103.218.172.76:1004", code: "#", image: "/projects/apple.png",
  },
  {
    name: "genesis", nameKo: "제네시스", year: "2026", solo: true, category: "Web",
    desc: "[클론 작업] Genesis 웹페이지의 반응형 레이아웃과 인터랙션을 구현했어요.",
    tech: ["Next.js","TypeScript","Tailwind CSS","GSAP","Swiper"],
    techUsage: [
      { skill: "Next.js",      usage: "App Router로 페이지와 레이아웃을 구성하고 이미지를 최적화해요." },
      { skill: "TypeScript",   usage: "컴포넌트 props와 locale 데이터 타입을 정의했어요." },
      { skill: "Tailwind CSS", usage: "레이아웃, 컬러, 타이포그래피를 유틸리티로 잡았어요." },
      { skill: "GSAP",         usage: "스크롤하면 섹션이 나타나도록 ScrollTrigger를 썼어요." },
      { skill: "Swiper",       usage: "히어로와 카드 캐러셀을 슬라이더로 넘겼어요." },
    ],
    href: "http://103.218.172.76:6102", code: "#", image: "/projects/genesis.png",
  },
  {
    name: "airport-typing", nameKo: "에어포트 타이핑", year: "2026", solo: true, category: "Web",
    desc: "[개인 프로젝트] 메트로 타이핑에 영감을 받아 전 세계 공항 이름을 타이핑하는 게임을 만들었어요.",
    tech: ["React","Vite","GSAP","Sass"],
    techUsage: [
      { skill: "React",  usage: "홈, 설정, 게임, 결과, 랭크, 컬렉션 화면을 상태와 함께 전환해요." },
      { skill: "Vite",   usage: "개발 서버와 빌드를 맡고, 게임 엔진 모듈을 나눴어요." },
      { skill: "GSAP",   usage: "세계지도 줌과 비행 경로 애니메이션을 넣었어요." },
      { skill: "Sass",   usage: "게임 HUD와 홈, 오버레이 스타일을 나눴어요." },
    ],
    href: "http://103.218.172.76:3000", code: "#", image: "/projects/airport-typing.png",
  },
  {
    name: "portfolio", nameKo: "포트폴리오", year: "2026", solo: true, category: "Web",
    desc: "[개인 프로젝트] 지금 보고 있는 포트폴리오 사이트를 만들었어요.",
    tech: ["Next.js","TypeScript","Tailwind CSS","Framer Motion","Cloudflare"],
    techUsage: [
      { skill: "Next.js",       usage: "App Router로 한 페이지를 구성하고 OpenNext로 배포해요." },
      { skill: "TypeScript",    usage: "프로젝트 데이터와 컴포넌트 props 타입을 정의했어요." },
      { skill: "Tailwind CSS",  usage: "레이아웃, 글래스 카드, 라이트·다크 테마를 잡았어요." },
      { skill: "Framer Motion", usage: "프로젝트 카드가 모달로 이어지게 하고, 스킬 탭을 전환해요." },
      { skill: "Cloudflare",    usage: "Workers에 이 포트폴리오를 배포해요." },
    ],
    href: "/", code: "https://github.com/d3vKJ/kj_portfolio_new", image: "/projects/portfolio.png",
  },
  {
    name: "youtube-music", nameKo: "유튜브 뮤직", year: "2026", solo: true, category: "Desktop",
    desc: "[개인 프로젝트] 기존 유튜브 뮤직 웹이 불편해서 데스크톱에서 재생하는 앱을 만들었어요.",
    tech: [], techUsage: [], href: "#", code: "#", image: null,
  },
];
