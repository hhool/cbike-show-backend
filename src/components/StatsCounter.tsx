"use client";

import { useRef, useEffect, useState } from "react";

interface Stat {
  numericValue: number;
  display: string;
  label: string;
}

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let current = 0;
    const steps = Math.ceil(duration / 16);
    const increment = target / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

function StatCard({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const count = useCountUp(stat.numericValue, 1400, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Once animation completes, show the full display string (e.g. "1,680+")
  const displayValue = active && count >= stat.numericValue ? stat.display : count.toLocaleString();

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-blue-700 tabular-nums mb-2">
        {displayValue}
      </div>
      <div className="text-sm text-gray-500">{stat.label}</div>
    </div>
  );
}

interface Props {
  isEn: boolean;
}

export function StatsCounter({ isEn }: Props) {
  const stats: Stat[] = isEn
    ? [
        { numericValue: 1680, display: "1,680+", label: "Registered Enterprises" },
        { numericValue: 120, display: "¥120B+", label: "Annual Output (RMB)" },
        { numericValue: 63, display: "63", label: "Export Countries" },
        { numericValue: 86000, display: "86,000+", label: "Industry Employees" },
      ]
    : [
        { numericValue: 1680, display: "1,680+", label: "注册企业" },
        { numericValue: 120, display: "120亿+", label: "年产值" },
        { numericValue: 63, display: "63", label: "出口国家" },
        { numericValue: 86000, display: "86,000+", label: "从业人员" },
      ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, i) => (
        <StatCard key={i} stat={stat} />
      ))}
    </div>
  );
}
