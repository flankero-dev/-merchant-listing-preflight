import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RouteScroll() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (hash) {
      let id: string;
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      target?.scrollIntoView();
      target?.setAttribute("tabindex", "-1");
      target?.focus({ preventScroll: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const heading = Array.from(
        document.querySelectorAll<HTMLElement>("main h1"),
      ).find((element) => element.getClientRects().length > 0);
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
    }
  }, [pathname, hash]);
  return null;
}
