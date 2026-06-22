import { useEffect, useRef, useState } from 'react';

/**
 * Reveal on scroll — adiciona `data-reveal="in"` quando entra na viewport.
 * Use com a classe utilitária `.reveal` (definida em index.css) para fade-up sutil.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return { ref, visible } as const;
}
