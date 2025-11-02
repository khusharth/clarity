"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useTodos } from "../store/todos";

function Piece({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.3, delay }}
      className="absolute top-0 h-2 w-2 rounded-sm"
      style={{ left: x + "%", backgroundColor: color }}
    />
  );
}

export default function ConfettiOverlay() {
  const reduced = useReducedMotion();
  const { confettiKey } = useTodos();
  const [activeKey, setActiveKey] = useState<number>(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (confettiKey !== activeKey) {
      setActiveKey(confettiKey);
      setVisible(true);
      const timeout = setTimeout(() => setVisible(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [confettiKey, activeKey]);

  const pieces = useMemo(() => {
    const arr = Array.from({ length: 30 }, (_, i) => i);
    const colors = ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#f87171"];
    return arr.map((i) => ({
      delay: (i % 10) * 0.03,
      x: Math.random() * 100,
      color: colors[i % colors.length],
    }));
  }, [activeKey]);

  if (reduced || !visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <motion.div
        initial={{ y: -40, opacity: 1 }}
        animate={{ y: 240, opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="relative mx-auto mt-24 h-0 w-full max-w-4xl"
      >
        {pieces.map((p, idx) => (
          <Piece key={idx + "-p"} delay={p.delay} x={p.x} color={p.color} />
        ))}
      </motion.div>
    </div>
  );
}


