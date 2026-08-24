// Minimal inline icon set (stroke-based, inherits currentColor).

type IconProps = { name: IconName; size?: number };
export type IconName =
  | "dashboard"
  | "calendar"
  | "book"
  | "check"
  | "trophy"
  | "sparkles"
  | "settings"
  | "plus"
  | "trash"
  | "flame"
  | "logout"
  | "clock"
  | "chart";

const paths: Record<IconName, string> = {
  dashboard: "M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 14h7v7H3z",
  calendar: "M3 4h18v18H3zM3 9h18M8 2v4M16 2v4",
  book: "M4 3h13a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H4zM4 3v16",
  check: "M4 12l5 5L20 6",
  trophy: "M6 4h12v4a6 6 0 0 1-12 0zM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 20h6M12 14v6",
  sparkles: "M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4zM19 14l.8 2 .2.8 2 .2-2 .8-.2 2-.8-2-2-.2 2-.2z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.3 1a7 7 0 0 0-1.7-1L14.5 3h-4l-.4 2.4a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L4 11a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.4h4l.4-2.4a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.6a7 7 0 0 0 .1-1z",
  plus: "M12 5v14M5 12h14",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  flame: "M12 2c1 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 1 0-1-4-1-8z",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h9",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  chart: "M3 21h18M6 21V11M12 21V4M18 21V8",
};

export function Icon({ name, size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
