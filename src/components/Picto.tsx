const PICTO = {
  passport: (
    <path d="M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6zm6 4.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM9 16.5h6v1.5H9z" />
  ),
  baggage: (
    <path d="M9 3h6v3h3.5A1.5 1.5 0 0 1 20 7.5v11a1.5 1.5 0 0 1-1.5 1.5H18v1h-2.5v-1h-7v1H6v-1h-.5A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H9zm1.5 1.5V6h3V4.5zM8 9v8h1.5V9zm6.5 0v8H16V9z" />
  ),
  departures: (
    <path d="M2.5 19h19v2h-19zm19.1-9.6c.2.8-.3 1.6-1.1 1.9L5.3 15.4 2.6 10.8l1.5-.4 2 1.6 5.1-1.4L7 3.6l1.9-.5 7.1 6.4 4.1-1.1c.7-.2 1.4.2 1.5 1z" />
  ),
  info: (
    <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1.3 8v8h2.6v-8zm1.3-4.3a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
  ),
};

export type PictoName = keyof typeof PICTO;

export function Picto({ name, className = "h-7 w-7" }: { name: PictoName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      {PICTO[name]}
    </svg>
  );
}

