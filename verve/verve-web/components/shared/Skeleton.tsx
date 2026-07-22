type Props = {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  delay?: number;
};

export default function Skeleton({
  className = "",
  width,
  height = "16px",
  rounded = true,
}: Props) {
  return (
    <div
      className={`animate-pulse bg-border/40 ${rounded ? "rounded-md" : ""} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
