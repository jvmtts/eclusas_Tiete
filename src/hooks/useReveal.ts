import { useEffect, useRef } from "react";

export function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
      return;
    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    let observer: IntersectionObserver | undefined;
    const revealAll = () => {
      observer?.disconnect();
      targets.forEach((target) =>
        target.removeAttribute("data-reveal-pending"),
      );
    };
    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.removeAttribute("data-reveal-pending");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px 30px 0px" },
      );
      targets.forEach((target) => {
        target.setAttribute("data-reveal-pending", "");
        observer!.observe(target);
      });
      window.addEventListener("beforeprint", revealAll);
      window.addEventListener("pagehide", revealAll);
    } catch {
      revealAll();
    }
    return () => {
      revealAll();
      window.removeEventListener("beforeprint", revealAll);
      window.removeEventListener("pagehide", revealAll);
    };
  }, []);
  return ref;
}
