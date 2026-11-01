"use client";

import { useEffect, useRef } from "react";

/** 유튜브 영상 모달: 열리자마자 띄우고, Esc·바깥 클릭·닫기 버튼으로 닫혀요 */
export default function VideoModal({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => dialog.current?.showModal(), []);
  const id = src.split("/").pop();

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onClose={onClose}
      // 탑승권 바깥 클릭 닫기까지 번지지 않게 여기서 멈춰요
      onClick={(e) => (e.stopPropagation(), e.target === e.currentTarget && dialog.current?.close())}
      className="m-auto w-[min(960px,calc(100%-32px))] overflow-visible bg-transparent backdrop:bg-black/70"
    >
      <div className="flex justify-end pb-2">
        <button type="button" onClick={() => dialog.current?.close()} aria-label="영상 닫기" className="grid h-10 w-10 place-items-center rounded-full text-xl text-white/80 hover:bg-white/15 hover:text-white">✕</button>
      </div>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="aspect-video w-full rounded-2xl bg-black"
      />
    </dialog>
  );
}
