// 펄 광택 전역 오버레이 + 배경 blob
export default function PearlBg() {
  return (
    <>
      <div aria-hidden className="bg-blob bg-blob-1" />
      <div aria-hidden className="bg-blob bg-blob-2" />
      <div aria-hidden className="bg-blob bg-blob-3" />
      <div aria-hidden className="pearl-bg pointer-events-none fixed inset-0 z-[25]" />
    </>
  );
}
