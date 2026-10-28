export type IconInfo = { slug?: string; color: string; light?: boolean; svg?: string };

export const ICONS: Record<string, IconInfo> = {
  "HTML": { slug: "html5", color: "#E34F26" },
  "CSS": { slug: "css", color: "#1572B6" },
  "JavaScript": { slug: "javascript", color: "#F7DF1E" },
  "Lua": { slug: "lua", color: "#2C2D72" },
  "React": { slug: "react", color: "#61DAFB" },
  "Next.js": { slug: "nextdotjs", color: "#ffffff", light: true },
  "TypeScript": { slug: "typescript", color: "#3178C6" },
  "Tailwind CSS": { slug: "tailwindcss", color: "#06B6D4" },
  "Framer Motion": { slug: "framer", color: "#0055FF" },
  "GSAP": { slug: "greensock", color: "#88CE02" },
  "Sass": { slug: "sass", color: "#CC6699" },
  "Swiper": { slug: "swiper", color: "#6330F4" },
  "Figma": { slug: "figma", color: "#F24E1E" },
  "Photoshop": { color: "#31A8FF", svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#001E36"/><text x="12" y="16.5" text-anchor="middle" font-family="Arial" font-weight="700" font-size="11" fill="#31A8FF">Ps</text></svg>` },
  "Git": { slug: "git", color: "#F05032" },
  "Vite": { slug: "vite", color: "#646CFF" },
  "Electron": { slug: "electron", color: "#47848F" },
  "Node.js": { slug: "nodedotjs", color: "#339933" },
  "Supabase": { slug: "supabase", color: "#3FCF8E" },
  "Cloudflare": { slug: "cloudflare", color: "#F38020" },
  "MySQL": { slug: "mysql", color: "#4479A1" },
  "Cursor AI": { slug: "cursor", color: "#ffffff", light: true },
  "Claude Code": {
    color: "#D97757",
    svg: `<svg viewBox="0 0 512 512" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><path d="M447.957 233.579H512v66.176h-64v64.597h-31.723v62.315H384v-62.315h-31.723v62.315H320v-62.315H192v62.315h-32.256v-62.315H128v62.315H95.723v-62.315H64v-64.619H0V233.6h64V106.667h383.957v126.912zm-319.957 0h31.744v-60.736H128v60.736zm224.213 0H384v-60.736h-31.787v60.736z" fill="#d97757"/></svg>`,
  },
  "Codex": {
    color: "#ffffff",
    light: true,
    svg: `<svg viewBox="0 0 512 512" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><g transform="scale(16)"><clipPath id="codex_clip"><path d="M0 0h32v32H0z"/></clipPath><g clip-path="url(#codex_clip)"><path d="M10.781.61a8.134 8.134 0 014.062-.554c1.777.204 3.361.96 4.752 2.267.038.036.092.05.142.038 1.878-.461 3.683-.298 5.415.488l.084.04.205.102c1.81.937 3.107 2.36 3.891 4.264.37.905.557 1.85.561 2.834a7.519 7.519 0 01-.24 2.175.221.221 0 00.054.207 7.978 7.978 0 012.104 3.854c.513 2.535-.014 4.82-1.578 6.854l-.242.293a8.093 8.093 0 01-3.912 2.468.219.219 0 00-.144.136c-.34.981-.682 1.819-1.316 2.656-1.599 2.11-3.95 3.283-6.598 3.268-2.11-.01-3.981-.783-5.613-2.315a.192.192 0 00-.187-.042c-.69.222-1.386.254-2.138.246a7.892 7.892 0 01-3.46-.829 8.088 8.088 0 01-2.862-2.375c-.27-.358-.538-.696-.734-1.094-.271-.55-.491-1.122-.66-1.711a8.139 8.139 0 01-.023-4.085c.01-.032.015-.066.01-.099a.155.155 0 00-.049-.085 7.935 7.935 0 01-1.84-2.936 6.908 6.908 0 01-.444-2.119 9.234 9.234 0 01.251-2.843c.6-1.978 1.745-3.53 3.436-4.657a6.25 6.25 0 011.07-.584c.38-.16.763-.293 1.147-.405a.17.17 0 00.116-.116A8.008 8.008 0 017.513 3.08C8.42 1.952 9.51 1.128 10.781.61zM9.71 11.075a1.13 1.13 0 00-1.964 1.123l2.259 3.953-2.25 3.797a1.132 1.132 0 00-.135.535 1.131 1.131 0 002.081.617l2.587-4.362c.208-.35.21-.786.009-1.139l-2.587-4.524zm7.262 8.32a1.138 1.138 0 00-1.066 1.13c0 .595.471 1.094 1.066 1.13h6.464c.6-.03 1.077-.53 1.077-1.13 0-.6-.477-1.102-1.077-1.131H16.97v.001z" fill="currentColor"/></g></g></svg>`,
  },
  "Antigravity": {
    color: "#3186FF",
    svg: `<svg viewBox="0 0 180 180" fill="none"><path d="M144.248 149.062C151.748 154.688 162.998 150.938 152.685 140.625C121.748 110.625 128.31 28.125 89.8727 28.125C51.4352 28.125 57.9977 110.625 27.0602 140.625C15.8102 151.875 27.9977 154.688 35.4977 149.062C64.5602 129.375 62.6852 94.6875 89.8727 94.6875C117.06 94.6875 115.185 129.375 144.248 149.062Z" fill="#3186FF"/><mask id="ag_mask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="22" y="28" width="136" height="125"><path d="M144.248 149.062C151.748 154.688 162.998 150.938 152.685 140.625C121.748 110.625 128.31 28.125 89.8727 28.125C51.4352 28.125 57.9977 110.625 27.0602 140.625C15.8102 151.875 27.9977 154.688 35.4977 149.062C64.5602 129.375 62.6852 94.6875 89.8727 94.6875C117.06 94.6875 115.185 129.375 144.248 149.062Z" fill="white"/></mask><g mask="url(#ag_mask)"><g filter="url(#ag_f0)"><ellipse cx="36.6225" cy="43.0872" rx="36.6225" ry="43.0872" transform="matrix(-0.112784 0.99362 -0.99362 -0.112781 106.557 -26.4847)" fill="#FFE432"/></g><g filter="url(#ag_f1)"><ellipse cx="155.163" cy="54.9292" rx="47.4118" ry="48.4541" transform="rotate(76.9243 155.163 54.9292)" fill="#FC413D"/></g><g filter="url(#ag_f2)"><ellipse cx="14.6006" cy="65.4425" rx="49.5515" ry="64.192" transform="rotate(74.1257 14.6006 65.4425)" fill="#00B95C"/></g><g filter="url(#ag_f3)"><ellipse cx="14.6006" cy="65.4425" rx="49.5515" ry="64.192" transform="rotate(74.1257 14.6006 65.4425)" fill="#00B95C"/></g><g filter="url(#ag_f4)"><ellipse cx="18.1226" cy="67.414" rx="48.5679" ry="53.4688" transform="rotate(45.6065 18.1226 67.414)" fill="#00B95C"/></g><g filter="url(#ag_f5)"><ellipse cx="121.837" cy="166.945" rx="46.6356" ry="44.9084" transform="rotate(76.9243 121.837 166.945)" fill="#3186FF"/></g><g filter="url(#ag_f6)"><ellipse cx="53.9456" cy="56.8997" rx="53.9456" ry="56.8997" transform="matrix(-0.409539 0.912293 -0.912294 -0.409537 162.811 -25.895)" fill="#FBBC04"/></g><g filter="url(#ag_f7)"><path d="M4.21557 239.063C-25.3231 227.467 25.1577 132.061 37.7105 100.085C50.2634 68.1097 84.3853 51.5888 113.924 63.1848C143.463 74.7809 178.474 138.65 165.921 170.626C153.368 202.601 33.7543 250.659 4.21557 239.063Z" fill="#3186FF"/></g><g filter="url(#ag_f8)"><path d="M183.197 120.315C175.289 129.545 154.652 124.839 137.102 109.803C119.553 94.7668 111.738 75.0955 119.646 65.8656C127.554 56.6357 148.191 61.3423 165.74 76.3782C183.289 91.414 191.105 111.085 183.197 120.315Z" fill="#749BFF"/></g><g filter="url(#ag_f9)"><ellipse cx="148.928" cy="36.7252" rx="71.1018" ry="44.199" transform="rotate(34.0763 148.928 36.7252)" fill="#FC413D"/></g><g filter="url(#ag_f10)"><ellipse cx="37.848" cy="46.0346" rx="38.1008" ry="22.1575" transform="rotate(112.516 37.848 46.0346)" fill="#FFEE48"/></g></g><defs><filter id="ag_f0" x="4.09591" y="-44.1761" width="111.037" height="98.4416" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="6.25234"/></filter><filter id="ag_f1" x="46.2974" y="-53.0009" width="217.731" height="215.86" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="30.2268"/></filter><filter id="ag_f2" x="-100.018" y="-36.7558" width="229.238" height="204.397" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="25.6957"/></filter><filter id="ag_f3" x="-100.018" y="-36.7558" width="229.238" height="204.397" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="25.6957"/></filter><filter id="ag_f4" x="-84.3985" y="-35.003" width="205.042" height="204.834" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="25.6957"/></filter><filter id="ag_f5" x="27.9915" y="71.5493" width="187.691" height="190.791" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="24.4184"/></filter><filter id="ag_f6" x="-11.8808" y="-98.7085" width="201.38" height="197.45" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="22.1301"/></filter><filter id="ag_f7" x="-44.4432" y="19.9522" width="252.513" height="260.404" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="19.7631"/></filter><filter id="ag_f8" x="81.1915" y="25.7722" width="140.46" height="134.637" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="17.6843"/></filter><filter id="ag_f9" x="55.1499" y="-47.2531" width="187.555" height="167.957" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="14.9365"/></filter><filter id="ag_f10" x="-24.2633" y="-27.1515" width="124.223" height="146.372" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="18.4865"/></filter></defs></svg>`,
  },
};

export const LEVELS: Record<string, number> = {
  "HTML": 70,
  "CSS": 70,
  "JavaScript": 70,
  "Lua": 50,
  "React": 60,
  "Next.js": 50,
  "TypeScript": 50,
  "Tailwind CSS": 40,
  "Framer Motion": 50,
  "GSAP": 50,
  "Sass": 50,
  "Swiper": 50,
  "Figma": 80,
  "Photoshop": 80,
  "Git": 60,
  "Vite": 50,
  "Electron": 65,
  "Node.js": 60,
  "Supabase": 50,
  "Cloudflare": 50,
  "MySQL": 40,
  "Cursor AI": 99,
  "Claude Code": 99,
  "Codex": 99,
  "Antigravity": 99,
};

export const GROUPS = [
  {
    label: "Language",
    skills: ["HTML", "CSS", "JavaScript", "TypeScript", "Lua"],
  },
  {
    label: "Frontend",
    skills: ["React", "Next.js", "Tailwind CSS", "Sass"],
  },
  {
    label: "Library",
    skills: ["Framer Motion", "GSAP", "Swiper"],
  },
  {
    label: "Design",
    skills: ["Figma", "Photoshop"],
  },
  {
    label: "Tools & DX",
    skills: ["Git", "Vite", "Electron"],
  },
  {
    label: "Backend/Infra",
    skills: ["Node.js", "Supabase", "Cloudflare", "MySQL"],
  },
  {
    label: "AI",
    skills: ["Cursor AI", "Claude Code", "Codex", "Antigravity"],
  },
];
