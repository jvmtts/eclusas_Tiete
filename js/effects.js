export function initEffects() {
  const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (!motion || motion.matches || !("IntersectionObserver" in window)) return;

  const targets = document.querySelectorAll(
    ".journey-inner, .registration-heading, .preparation, .contact-grid > div, .site-footer",
  );
  let observer;
  const revealAll = () => {
    observer?.disconnect();
    targets.forEach((target) => target.removeAttribute("data-reveal-state"));
  };

  try {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-reveal-state", "visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px 32px 0px" },
    );
    targets.forEach((target, index) => {
      target.style.setProperty("--reveal-delay", `${(index % 2) * 70}ms`);
      target.setAttribute("data-reveal-state", "pending");
      observer.observe(target);
    });
    motion.addEventListener?.(
      "change",
      (event) => {
        if (event.matches) revealAll();
      },
      { once: true },
    );
    window.addEventListener("beforeprint", revealAll, { once: true });
    window.addEventListener("pagehide", revealAll, { once: true });
  } catch {
    revealAll();
  }
}
