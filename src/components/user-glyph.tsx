/** 经典圆形用户形象：没有上传头像时当作默认头像。 */
export function UserGlyph({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c.6-3.6 3.7-6 7.5-6s6.9 2.4 7.5 6" />
    </svg>
  );
}
