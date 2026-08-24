import { useEffect, useState } from "react";

// Fire a celebratory confetti shower from anywhere:  celebrate()
export function celebrate() {
  window.dispatchEvent(new CustomEvent("sdumi:celebrate"));
}

interface Piece {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  rounded: boolean;
}

const COLORS = ["#7c6cff", "#5aa9ff", "#38d6c8", "#f4b93a", "#3ecf8e", "#f26d6d", "#ff8a5c"];

let counter = 0;

export function ConfettiLayer() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const onCelebrate = () => {
      const batch: Piece[] = Array.from({ length: 90 }, () => ({
        id: counter++,
        left: Math.random() * 100,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.4,
        size: 7 + Math.random() * 8,
        rounded: Math.random() > 0.5,
      }));
      setPieces((p) => [...p, ...batch]);
      // Remove this batch after it finishes falling.
      const ids = new Set(batch.map((b) => b.id));
      window.setTimeout(() => {
        setPieces((p) => p.filter((x) => !ids.has(x.id)));
      }, 2600);
    };
    window.addEventListener("sdumi:celebrate", onCelebrate);
    return () => window.removeEventListener("sdumi:celebrate", onCelebrate);
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-layer">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.rounded ? p.size : p.size * 1.4,
            borderRadius: p.rounded ? "50%" : 2,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
