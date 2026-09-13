import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Ambient architectural backdrop — blueprint grid drifting in perspective,
 * slow light beams, and floating measurement particles. Extremely subtle.
 */
export function SpatialBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const dots = Array.from({ length: 34 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3 + 0.4,
      vy: (Math.random() * 0.12 + 0.03) / 100,
      vx: (Math.random() - 0.5) * 0.02 / 100,
      a: Math.random() * 0.35 + 0.12,
    }));

    let paused = false;
    const io = new IntersectionObserver(([e]) => { paused = !e.isIntersecting; });
    io.observe(canvas);

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (paused) return;
      ctx.clearRect(0, 0, w, h);

      /* drifting blueprint grid */
      const spacing = 88;
      const offset = (t / 90) % spacing;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0, 89, 78, 0.10)';
      ctx.beginPath();
      for (let x = -spacing + offset; x < w + spacing; x += spacing) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      for (let y = -spacing + offset; y < h + spacing; y += spacing) {
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      ctx.stroke();

      /* accent intersections */
      ctx.fillStyle = 'rgba(0, 89, 78, 0.16)';
      for (let x = -spacing + offset; x < w + spacing; x += spacing * 3) {
        for (let y = -spacing + offset; y < h + spacing; y += spacing * 3) {
          ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
      }

      /* floating particles */
      dots.forEach((d) => {
        d.y -= d.vy; d.x += d.vx;
        if (d.y < -0.05) { d.y = 1.05; d.x = Math.random(); }
        const px = d.x * w, py = d.y * h;
        const pulse = 0.75 + Math.sin(t / 900 + d.x * 12) * 0.25;
        ctx.beginPath();
        ctx.arc(px, py, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 89, 78, ${d.a * pulse * 0.55})`;
        ctx.fill();
      });
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />

      {/* slow light beams */}
      <motion.div
        className="absolute -top-1/3 left-[8%] w-[38vw] h-[150vh] origin-top"
        style={{ background: 'linear-gradient(180deg, hsl(168 100% 22% / 0.07), transparent 70%)', filter: 'blur(48px)', rotate: '14deg' }}
        animate={{ opacity: [0.5, 0.95, 0.5], x: [0, 26, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -top-1/3 right-[6%] w-[30vw] h-[150vh] origin-top"
        style={{ background: 'linear-gradient(180deg, hsl(160 84% 30% / 0.06), transparent 70%)', filter: 'blur(56px)', rotate: '-11deg' }}
        animate={{ opacity: [0.9, 0.45, 0.9], x: [0, -22, 0] }}
        transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* breathing gradient mesh */}
      <motion.div
        className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[70vw] h-[60vh] rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, hsl(168 100% 17% / 0.10), transparent 68%)', filter: 'blur(90px)' }}
        animate={{ scale: [1, 1.14, 1], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* vignette keeps content legible */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, hsl(0 0% 100% / 0.85) 100%)' }} />
    </div>
  );
}
