export function Brand({
  light = false,
  small = false,
}: {
  light?: boolean;
  small?: boolean;
}) {
  return (
    <a
      href="#inicio"
      aria-label="Usina do Jet e JetChula — início"
      className={`flex shrink-0 items-center ${small ? "gap-4" : "gap-3 sm:gap-6"}`}
    >
      <img
        src="/assets/usina.png"
        alt="Usina do Jet"
        width={58}
        height={58}
        className={`${small ? "size-11" : "size-10 sm:size-14"} object-contain brightness-0 ${light ? "invert" : ""}`}
      />
      <span
        className={`h-7 w-px ${light ? "bg-white/20" : "bg-ink/15"}`}
        aria-hidden
      />
      <svg
        viewBox="70 490 980 365"
        role="img"
        aria-label="JetChula"
        className={`${small ? "h-9 w-25" : "h-9 w-21 sm:h-10 sm:w-29"} brightness-0 ${light ? "invert" : ""}`}
      >
        <image href="/assets/jet-chula.png" width="1080" height="1350" />
      </svg>
    </a>
  );
}
