import React, { useEffect, useRef } from 'react';

interface Props {
  fxLevel?: 'high' | 'eco';
}

export const CyberBackground: React.FC<Props> = ({ fxLevel = 'high' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (fxLevel === 'eco') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulseSpeed: number;
      color: string;
    }> = [];

    const colors = ['#22d3ee', '#a855f7', '#ffffff', '#c084fc'];
    const count = Math.min(32, Math.floor(width / 40));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        radius: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.35 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed * 0.05) * 0.005;

        // Wrap boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.65, p.alpha));
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [fxLevel]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0a0c]">
      {/* Immersive radial gradient backdrop */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0c 100%)'
        }}
      />

      {/* Top and Bottom atmospheric ambient glow orbs */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-purple-600/10 rounded-full blur-[150px]" />
      <div className="absolute -bottom-40 right-[-5%] w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[160px]" />
      <div className="absolute top-1/2 left-[-10%] w-[350px] h-[350px] bg-purple-500/8 rounded-full blur-[140px]" />

      {/* Subtle micro grid overlay for immersive depth */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #22d3ee 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* Floating Canvas Particles */}
      {fxLevel === 'high' && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      )}
    </div>
  );
};
