"use client";

/** 키보드 사용자가 히어로를 건너뛰고 섹션으로 바로 이동할 수 있는 스킵 링크 */
export default function SkipToSections() {
  const handleSkip = () => {
    window.dispatchEvent(
      new CustomEvent("navigate-section", { detail: { action: "go", index: 0 } }),
    );
  };

  return (
    <a
      href="#main-sections"
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        handleSkip();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSkip();
        }
      }}
    >
      포트폴리오 섹션으로 건너뛰기
    </a>
  );
}
