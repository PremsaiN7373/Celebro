interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-16 h-16 text-lg",
};

const PALETTE = [
  "bg-accent-100 text-accent-700",
  "bg-ink-200 text-ink-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
];

export default function Avatar({ name, size = "md" }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

  const colorIndex = name.charCodeAt(0) % PALETTE.length;

  return (
    <div
      className={`${SIZES[size]} ${PALETTE[colorIndex]} rounded-full flex items-center justify-center font-semibold shrink-0`}
    >
      {initials}
    </div>
  );
}
