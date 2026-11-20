"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

interface Props {
  /** Texto final, por ejemplo "+500" o "98%". */
  value: string;
  /** Duración del conteo en segundos. */
  duration?: number;
}

const formatter = new Intl.NumberFormat("es-AR");

/**
 * Número que cuenta desde 0 hasta su valor cuando aparece en pantalla.
 * Reserva el ancho del valor final para que el texto de alrededor no salte, y
 * los lectores de pantalla leen siempre el valor final.
 */
export default function CountUp({ value, duration = 2 }: Props) {
  const match = value.match(/^(\D*)([\d.]+)(\D*)$/);
  const isNumeric = match !== null;
  const prefix = match?.[1] ?? "";
  const target = match ? Number(match[2].replace(/\./g, "")) : 0;
  const suffix = match?.[3] ?? "";

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion || !isNumeric) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setCurrent(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, target, duration, isNumeric]);

  if (!isNumeric) return <>{value}</>;

  const shown = reduceMotion ? target : current;

  return (
    <span ref={ref} className="relative inline-grid justify-items-center">
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {prefix}
        {formatter.format(target)}
        {suffix}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {prefix}
        {formatter.format(shown)}
        {suffix}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
