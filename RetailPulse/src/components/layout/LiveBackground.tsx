import React, { useEffect, useRef } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import glassRibbonBg from '../../assets/glass_ribbon_bg.jpg';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  baseAlpha: number;
}

export const LiveBackground: React.FC = () => {
  const { theme } = useDashboard();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates for interactive ripple
    let mouse = { x: width / 2, y: height / 2, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Initialize particles
    const particleCount = Math.min(50, Math.floor((width * height) / 25000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2,
        baseAlpha: Math.random() * 0.5 + 0.2
      });
    }

    let time = 0;

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      const isDark = theme === 'dark';

      // 1. Draw animated soft ambient glowing energy orbs in canvas
      const orb1X = width * 0.75 + Math.sin(time * 0.6) * 120;
      const orb1Y = height * 0.25 + Math.cos(time * 0.5) * 80;
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, 450);
      if (isDark) {
        grad1.addColorStop(0, 'rgba(34, 197, 94, 0.06)');
        grad1.addColorStop(0.5, 'rgba(56, 189, 248, 0.03)');
        grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad1.addColorStop(0, 'rgba(167, 243, 208, 0.35)');
        grad1.addColorStop(0.6, 'rgba(186, 230, 253, 0.2)');
        grad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const orb2X = width * 0.2 + Math.cos(time * 0.7) * 100;
      const orb2Y = height * 0.8 + Math.sin(time * 0.6) * 90;
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, 500);
      if (isDark) {
        grad2.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
        grad2.addColorStop(0.5, 'rgba(38, 38, 38, 0.02)');
        grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad2.addColorStop(0, 'rgba(224, 231, 255, 0.3)');
        grad2.addColorStop(0.7, 'rgba(243, 244, 246, 0.1)');
        grad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // 2. Render and update live floating particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Mouse avoidance/gentle reaction
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            p.x -= (dx / dist) * force * 1.5;
            p.y -= (dy / dist) * force * 1.5;
          }
        }

        // Screen wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if (isDark) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.6})`;
        } else {
          ctx.fillStyle = `rgba(15, 23, 42, ${p.alpha * 0.35})`;
        }
        ctx.fill();

        // Connect nearby particles with subtle filament lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / 110) * (isDark ? 0.08 : 0.12);
            ctx.strokeStyle = isDark
              ? `rgba(255, 255, 255, ${lineAlpha})`
              : `rgba(15, 23, 42, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500">
      
      {/* 3D Glass Ribbon Organic Artwork in the Background with gentle continuous drift */}
      <div 
        className={`absolute -top-10 -right-16 w-[70vw] max-w-[1250px] h-[85vh] bg-contain bg-right-top bg-no-repeat transition-all duration-700 pointer-events-none animate-float-slow ${
          isDark
            ? 'opacity-15 mix-blend-screen filter invert contrast-125'
            : 'opacity-45 mix-blend-multiply'
        }`}
        style={{ backgroundImage: `url(${glassRibbonBg})` }}
      />

      {/* HTML5 Interactive Particle & Live Aura Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none" 
      />

      {/* Radial Vignette Mask */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-t from-black via-transparent to-black/60'
            : 'bg-gradient-to-t from-[#F3F5F8]/70 via-transparent to-white/40'
        }`}
      />

    </div>
  );
};
