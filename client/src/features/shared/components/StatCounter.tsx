import { useEffect, useRef, useState } from "react";

type StatCounterProps = {
  end: number;
  suffix: string;
  label: string;
};

export function StatCounter({ end, suffix, label }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    let timerId: ReturnType<typeof window.setInterval> | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        let currentValue = 0;
        const step = Math.ceil(end / 60);

        timerId = window.setInterval(() => {
          currentValue += step;

          if (currentValue >= end) {
            setCount(end);
            window.clearInterval(timerId);
            return;
          }

          setCount(currentValue);
        }, 24);

        observer.disconnect();
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      if (timerId) {
        window.clearInterval(timerId);
      }
    };
  }, [end]);

  return (
    <div ref={containerRef} className="text-center">
      <div className="text-4xl font-black tracking-tight text-white">
        {count.toLocaleString()}
        <span className="text-[#00ff88]">{suffix}</span>
      </div>
      <div className="mt-1 text-xs uppercase tracking-widest text-[#557]">
        {label}
      </div>
    </div>
  );
}
