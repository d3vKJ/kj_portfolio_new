# Design Concept

프론트엔드 개발자 포트폴리오. 컨셉: **Kinetic Craft** — 가만히 있으면 다크 미니멀이지만, 마우스가 움직이는 순간 공간이 반응한다.
과시하는 화려함이 아니라 "이 사람 디테일 잘 챙기네"를 느끼게 하는 절제된 포인트 인터랙션이 핵심. (v1의 "차분한 다크 미니멀"에서 확장 — 톤은 유지하되 인터랙션 레이어 추가)

리뉴얼 진행 기록: [REDESIGN-PLAN.md](REDESIGN-PLAN.md)

## 컬러

| 용도 | 값 | 비고 |
|---|---|---|
| bg | `#0a0a0a` | 순검정 아님, 아주 짙은 그레이. body/Hero/SectionSlider 전부 통일 |
| surface | `white/[0.04]` + border `white/[0.08~0.14]` | 반투명 유리 카드 |
| text | `white` 계열 opacity 단계 (`/80 /65 /45 /35 /25`) | 위계를 opacity로 표현 |
| accent | `#6ee7ff` (`--accent`, `globals.css`) | 저채도 시안 1개. hover·활성 인덱스·링크·커서 글로우에만 사용. 배경/본문에는 쓰지 않음 |

라이트모드는 아직 미구현 — 다크 전용으로 유지, 필요 시 별도 작업.

## 레이아웃 그리드

전 섹션이 아래 전역 변수로 좌우 여백을 통일한다 (`globals.css`). 섹션마다 `pl-40`/`pl-44` 같은 매직넘버를 따로 쓰지 않는다.

```css
--content-pl: 1.5rem;                        /* 모바일: 일반 거터 */
--content-pr: clamp(1.5rem, 5vw, 4rem);
--content-max: 1680px;                        /* 초광폭 화면에서 콘텐츠가 한쪽으로 쏠리지 않게 상한선 */

@media (min-width: 640px) {
  --content-pl: clamp(9.5rem, 8vw, 11rem);    /* sm 이상: 좌측 Sidebar(w-36=9rem) 폭을 확실히 넘김 */
}
```

각 섹션 내부 콘텐츠는 `mx-auto max-w-[var(--content-max)]`로 감싸 QHD/WQHD에서도 한쪽으로 쏠리지 않고 중앙에 머문다 (`Projects`/`AboutMe`/`Contact`/`Skills` 전부 적용).

Projects 카드 그리드는 `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`, 모든 카드가 `16:10` 고정 비율이라 브레이크포인트가 바뀌어도 텍스트 줄이 항상 카드와 정렬된다 (한때 화면 높이에 맞춰 카드마다 다른 크기로 줄어드는 방식을 썼다가 정렬이 어긋나서 되돌림).

## 반응형 (모바일 → WQHD)

- **Sidebar**: `sm` 미만에서는 좌측 컬럼이 본문과 겹치므로(투명 배경 + 고정폭) **하단 탭 바**로 전환 (`Sidebar.tsx`, `sm:hidden` vs `hidden sm:flex`). Projects 카테고리 필터도 하단 바에 별도 행으로 붙는다. `sm` 이상은 기존 좌측 컬럼 유지
- **AboutMe / Contact**: 데스크톱은 3열/2열 flex-row, `lg` 미만에서는 `flex-col`로 세로 스택 + `overflow-y-auto` (기존엔 `overflow-hidden`이라 좁은 화면에서 2/3번째 컬럼이 통째로 잘려 안 보였음 — 실제 버그였음)
- **Skills 아이콘 그리드**: `grid-cols-[repeat(auto-fill,minmax(140px,1fr))]` — 카드가 줄 폭을 꽉 채우도록 `1fr` 사용 (여백이 너무 많다는 피드백 이후 `120px` 상한에서 변경)
- 모바일 하단 바가 콘텐츠를 가리지 않도록 각 섹션 하단에 `pb-20~32 sm:pb-0` 여백, Hero 스크롤 인디케이터·SectionSlider 진행 점도 `bottom-* sm:bottom-*`로 하단 바 위로 띄움
- 확인 해상도: 모바일(390×844), 태블릿(820×1180), 노트북(1440×900), FHD(1920×1080), QHD(2560×1440), WQHD(3440×1440)

## 타이포그래피

- 폰트: **Pretendard** (CDN 로드, `layout.tsx`) — 헤딩/본문 공용
- 섹션 타이틀(`About`/`Projects`/`Skills`/`Contact`/`History`): `.section-title` 클래스, `font-size: clamp(1.75rem, 1.1rem + 2.5vw, 3.25rem)`, `font-weight: 700` — 화면 크기에 따라 타이틀 스케일이 확연히 커짐
- 본문: `font-weight: 400`, 줄간격 1.6~1.8
- 숫자(연도·인덱스)는 `font-mono tabular-nums`로 대비
- 강조는 굵기 + opacity + accent 색으로, 색상 남발 금지 (accent는 1곳 이상 동시에 쓰지 않는다)

## 레이아웃 컨셉 (섹션별)

- **Sidebar** — 로고/이니셜 + 섹션 네비게이션만 (카테고리 필터는 Projects 내부로 이동해 단순화). 활성 인디케이터는 dot가 아니라 이동 시 늘어졌다 줄어드는 트레일(아래 모션 참고). 슬라이드 진행 점(하단 도트)은 제거 — Sidebar가 이미 활성 섹션을 보여주므로 중복
- **Hero** — 큰 로고 + 한 줄 소개, 정지 화면에서 마우스에 반응하는 3D 틸트
- **AboutMe** — 텍스트 중심, 이미지 최소화. History는 실제 이력이 쌓이기 전까지 더미 1개만 유지 (`TIMELINE` 배열에 항목 추가/교체)
- **Projects** — 카드 갤러리. 카테고리 필터 + 대표 스크린샷 카드(`16:10`)를 `sm:grid-cols-2 xl:grid-cols-3` 그리드로 나열, 모든 카드 동일 비율이라 텍스트 줄도 항상 정렬됨. 클릭하면 모달로 기술스택·링크 확장. `image: null`인 항목은 "Coming Soon" 플레이스홀더 카드로 표시 — 실제 프로젝트가 추가되기 전까지 더미 3개(`coming-soon-1~3`, Web/Desktop/Android 각 1개)가 카테고리 필터를 채워둠. 카드는 `cardIn` 키프레임으로 순차 등장(60ms 간격)
- **Skills** — 5개 카테고리를 탭으로 전환, 활성 탭만 큰 카드(140px~, 줄 폭을 꽉 채움)로 표시. 탭 언더라인은 accent, 카드는 `cardIn`으로 순차 등장. 커서 근접 부상 효과 + **hover 시 아이콘 고유 브랜드 컬러로 은은한 글로우** (`ICONS[name].color`를 CSS 변수 `--icon-color`로 전달, `box-shadow`에 사용)
- **Contact** — 중앙 집중형: 큰 CTA 한 줄 + 이메일을 크게 클릭 가능하게, GitHub/Instagram은 하단에 작은 원형 아이콘으로만. 폼은 꼭 필요할 때만

## 모션

기본 원칙(v1과 동일, 여전히 유효):
- 키보드/자동 트리거 액션에는 애니메이션 금지
- UI 애니메이션은 300ms 이내, `ease-out` 기본
- `prefers-reduced-motion` 존중 — 아래 4개 포인트 이펙트는 전부 감지 시 리스너 자체를 안 붙임

**포인트 이펙트** (처음엔 4곳으로 절제했지만, 사이트가 전반적으로 단조롭다는 피드백 이후 각 섹션에 최소 1개씩 자연스럽게 추가함 — 여전히 전면 실험적 방향은 아니고, 데이터/구조에 근거한 절제된 디테일 위주):

| 위치 | 효과 | 구현 |
|---|---|---|
| Hero 로고 | 마우스 위치 기반 `rotateX/rotateY` 틸트 (최대 ±4~5deg) | `Hero.tsx`, CSS transition 200ms ease-out |
| Projects 카드 → 모달 | 클릭한 카드의 스크린샷이 그 자리에서 모달 크기로 "확장"되는 shared-element 모프 | `Projects.tsx`, framer-motion `layoutId` |
| Skills 아이콘 | 커서 반경 140px 이내 거리 기반 `scale`+`translateY` 부상 | `Skills.tsx`, rAF 스로틀 |
| Skills 탭 전환 | 방향에 따라 살짝 회전하며 슬라이드 (단순 페이드 대신) | `Skills.tsx`, framer-motion `AnimatePresence` + `rotateY` |
| Sidebar 인디케이터 | 섹션 이동 시 `scaleY(1.8)`로 늘어졌다 `scaleY(1)`로 settle (overshoot 커브) | `Sidebar.tsx` |
| About History 도트 | "현재" 항목 도트 주위로 아주 은은하게 퍼지는 accent 글로우 (`dotGlow` 키프레임, opacity+scale 브리딩) | `AboutMe.tsx`, 도트 자체도 accent 색 |
| Skills 카드 hover | 아이콘 고유 브랜드 컬러로 은은한 `box-shadow` 글로우 | `Skills.tsx`, `--icon-color` CSS 변수 |
| 커스텀 커서 | 데스크톱(마우스)에서 링크·버튼 위를 지나면 커서가 부풀며 `mix-blend-difference`로 배경과 반전 | `MagneticCursor.tsx`, framer-motion 스프링 |

그 외 배경에는 마우스를 따라가는 아주 은은한 radial gradient(`CursorGlow.tsx`, accent 4% opacity)만 깔려 있다 — 평면 탈피용, 눈에 띄면 안 됨. Projects/Skills 카드는 `cardIn` 키프레임(fade+translateY, 항목마다 스태거)으로 등장한다.

**framer-motion을 쓴다** (사용자가 명시적으로 허용, 2026-09-22). Hero 틸트·Sidebar 트레일 같은 단순 hover/scroll 반응은 여전히 순수 CSS로 충분해서 그대로 두되, **shared-element 전환(Projects 모달)과 방향성 있는 페이지 전환(Skills 탭)처럼 순수 CSS로 어렵거나 장황해지는 것만** framer-motion으로 구현한다.

## 구현 주의사항

- **`position: fixed` + `SectionSlider`**: `SectionSlider.tsx`는 슬라이드 전체를 감싼 컨테이너에 `transform: translateX(...)`를 걸어 섹션을 전환한다. CSS 스펙상 `transform`이 걸린 조상은 `position: fixed` 자손의 containing block이 되어버려서, 슬라이드 내부 컴포넌트(Projects 등)에서 모달/툴팁을 `fixed`로 띄우면 뷰포트가 아니라 그 조상 기준으로 엉뚱한 곳에 렌더링된다. **해결: `createPortal`로 `document.body`에 직접 렌더링할 것** (Projects 모달 참고)
- **섹션 내부 스크롤은 `SectionSlider`의 슬라이드 래퍼(`overflow-auto`) 하나가 전담한다**: 처음엔 데스크톱에서 `SectionSlider`가 마우스 휠을 전부 섹션 전환에 써버려서 안쪽 콘텐츠가 스크롤이 안 되는 버그가 있었다 (Projects 카드 잘림으로 나타남). 이후 `SectionSlider.onWheel`에 `hasScrollRoom()` 체크를 추가해, **현재 슬라이드가 끝까지 스크롤되지 않았으면 휠을 섹션 전환 대신 내부 스크롤에 양보**하도록 고쳤다. 이 체크는 슬라이드 래퍼(`slideRefs`, `h-full overflow-auto`) 기준이므로, 각 섹션 컴포넌트는 자체 `overflow-y-auto`/`overflow-hidden`을 갖지 않는다 — 콘텐츠가 넘치면 그냥 자연스럽게 길어지고, 스크롤은 항상 바깥 슬라이드 래퍼가 담당한다. 새 섹션을 만들 때도 이 규칙을 따를 것 (섹션 자체에 overflow 클래스를 넣지 말 것)
- **가변 높이 카드에서 이미지를 잘리지 않게 보여줄 때는 "박스를 이미지 크기로" — "이미지를 박스 크기로"가 아니다**: `object-cover`는 위아래를 잘라먹고, `object-contain`만 쓰면 카드 테두리 박스가 그대로 남아 빈 여백(레터박스)이 보인다. 박스 자체를 `lg:h-auto lg:w-auto lg:max-h-full lg:max-w-full`로 이미지 크기에 맞춰 줄여야 여백이 안 생긴다. (지금 Projects 카드는 결국 고정 `16:10` 비율로 되돌려서 이 문제 자체가 없어졌지만, 화면 높이에 맞춰 가변적으로 줄어드는 카드를 다시 만들 일이 있으면 이 원칙을 적용할 것)
- **`motion.div`에 `layoutId`가 있으면 클릭이 부모로 버블링되지 않을 수 있다**: Projects 카드 이미지에 `layoutId`를 주고 그 위에서 클릭했더니 (Playwright든 실제 마우스든) 상위 `<button>`의 `onClick`이 전혀 발동하지 않는 문제가 있었다. `whileHover`/`whileTap`을 빼도, 이미지 자체에 `onClick`을 직접 달아도 안 됐다 — framer-motion이 `layoutId`가 있는 요소의 포인터 이벤트를 내부적으로 소비하는 것으로 보인다. **해결: 그 요소에 `style={{ pointerEvents: "none" }}`을 줘서 클릭이 통째로 부모(button)로 투과되게 할 것.** 이러면 hover 시 CSS `:hover`는 부모 기준으로 정상 동작하지만, 그 요소 자체에 별도 `onClick`/`whileTap`은 절대 못 붙인다 — 클릭 핸들러는 항상 pointer-events가 살아있는 조상에 둘 것
- **`AnimatePresence`로 `createPortal(...)`을 직접 감싸면 아무것도 렌더링되지 않는다**: `<AnimatePresence>{cond && createPortal(<motion.div/>, document.body)}</AnimatePresence>` 형태는 React state가 정상적으로 바뀌어도(직접 Fiber를 확인해도 state는 맞았음) 화면에 아무것도 나타나지 않았다. **해결: 순서를 뒤집어 `createPortal`을 바깥, `AnimatePresence`를 안쪽에 둘 것** — `createPortal(<AnimatePresence>{cond && <motion.div key="..."/>}</AnimatePresence>, document.body)`. 이때 `createPortal`을 조건 없이 항상 호출하게 되므로, 두 번째 인자 `document.body`가 SSR 중에 평가되어 `ReferenceError: document is not defined`가 나지 않도록 `typeof document !== "undefined" &&` 가드를 꼭 씌울 것 (Projects 모달 참고)

## 하지 않는 것

- accent를 배경/큰 면적에 칠하기 (hover·활성 상태에만)
- 전면 실험적인 모션 방향 (파티클 캔버스, 화려한 페이지 전환 등) — 새 이펙트를 추가하더라도 항상 실제 데이터(아이콘 브랜드 컬러 등)나 구조에 근거한 절제된 디테일로 제한
- 섹션마다 다른 배경색, 3종 이상 폰트, 5색 초과 팔레트
- 자동 재생 캐러셀/슬라이드쇼
- framer-motion을 단순 hover/fade에 쓰기 — CSS로 되는 건 CSS로. shared-element 전환처럼 CSS로 안 되는 것에만 사용
