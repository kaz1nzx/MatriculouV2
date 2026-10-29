import type { CSSProperties } from "react";
const paths: Record<string, string> = {
  arrow: "M5 12h14m-6-6 6 6-6 6",
  diagonal: "M6 18 18 6M6 6h12v12",
  search: "m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  school: "m2 9 10-5 10 5-10 5-10-5m4 2v6c4 3 8 3 12 0v-6m4-2v8",
  pin: "M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 1 1 14 0ZM14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  compare: "M8 4 4 8l4 4M4 8h13M16 12l4 4-4 4M20 16H7",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  chat: "M4 5h16v11H10l-4 4v-4H4ZM8 10h8M8 13h5",
  dot: "M13.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0",
  check: "m5 12 4 4L19 6",
  book: "M12 5v16M3 3c4-1 7 0 9 2 2-2 5-3 9-2v16c-4-1-7 0-9 2-2-2-5-3-9-2Z",
  pause: "M8 5v14M16 5v14",
  play: "m8 5 10 7-10 7Z",
  left: "m14 5-7 7 7 7",
  right: "m10 5 7 7-7 7",
  down: "M12 4v16m-6-6 6 6 6-6",
  close: "m6 6 12 12M6 18 18 6",
  globe:
    "M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0ZM3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18",
  user: "M20 21a8 8 0 0 0-16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  file: "M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Zm0 0v5h5M9 13h6M9 17h6",
  upload: "M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3",
  download: "M12 4v12m-5-5 5 5 5-5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3",
  logout: "M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 17l5-5-5-5M15 12H3",
  edit: "M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  shield: "M12 3 5 6v6c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6ZM9 12l2 2 4-4",
  camera: "M4 8h3l2-3h6l2 3h3v11H4ZM15 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  mail: "M3 6h18v12H3zM3 7l9 7 9-7",
  plus: "M12 5v14M5 12h14",
  grid: "M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z",
  menu: "M4 7h16M4 12h16M4 17h16",
  filter: "M4 5h16l-6 8v6l-4 1v-7Z",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9Z",
  building:
    "M4 21V5l8-3 8 3v16M4 21h16M9 21v-4h6v4M8 8h1m3 0h1m3 0h1M8 12h1m3 0h1m3 0h1",
  users:
    "M16 20a5 5 0 0 0-10 0M11 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20a4 4 0 0 0-3.5-4M16 4.3a3.5 3.5 0 0 1 0 6.4",
  chart: "M4 20V10m6 10V4m6 16v-7m4 7H3",
  megaphone: "M4 10v4h3l7 4V6L7 10H4Zm14-1a3 3 0 0 1 0 6M7 14l1 5h2",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z",
  lock: "M6 11h12v10H6zM8 11V7a4 4 0 1 1 8 0v4M12 15v2",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4ZM10 21h4",
  inbox: "M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6H3v-6Z",
  send: "m4 12 16-8-6 16-2.5-6.5L4 12Zm7.5 1.5L20 4",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  eyeOff:
    "M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2",
  alert: "M12 3 2 20h20L12 3Zm0 6v5m0 3v.5",
  info: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6m0-9v.5",
  external:
    "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  sliders: "M4 6h10m4 0h2M4 12h4m4 0h8M4 18h12m4 0h0M16 4v4M10 10v4M18 16v4",
  trophy:
    "M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4v2a3 3 0 0 0 4 3M16 6h4v2a3 3 0 0 1-4 3M12 13v4m-4 3h8l-1-3H9Z",
  calendar: "M4 6h16v15H4zM4 10h16M8 3v5m8-5v5",
  phone:
    "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1",
  chevron: "m6 9 6 6 6-6",
  refresh:
    "M20 11a8 8 0 0 0-14.7-4.3L4 9m0-5v5h5M4 13a8 8 0 0 0 14.7 4.3L20 15m0 5v-5h-5",
  help: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14m0 3v.5",
  home: "M3 11 12 4l9 7M5 10v10h5v-6h4v6h5V10",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM8.5 14 7 21l5-3 5 3-1.5-7",
  sort: "M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3",
  sparkle:
    "M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  history: "M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5M12 7v5l3 2",
};
export function CinemaIcon({
  name,
  size = 20,
  style,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      className="cinemaIcon"
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.dot} />
    </svg>
  );
}
