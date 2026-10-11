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
      document.getElementById(id)?.scrollIntoView();
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, hash]);
  return null;
}
