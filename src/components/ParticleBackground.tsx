import React, { useEffect, useRef } from "react";

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop with stunning visual effects
    const animate = () => {
      time += 0.01;

      // Clear canvas with solid black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated grid lines
      ctx.strokeStyle = "rgba(212, 175, 55, 0.1)";
      ctx.lineWidth = 1;
      const gridSize = 100;
      const gridOffset = time * 20;

      for (let x = -gridSize; x < canvas.width + gridSize; x += gridSize) {
        const offsetX = x + (gridOffset % gridSize);
        ctx.beginPath();
        ctx.moveTo(offsetX, 0);
        ctx.lineTo(offsetX, canvas.height);
        ctx.stroke();
      }

      for (let y = -gridSize; y < canvas.height + gridSize; y += gridSize) {
        const offsetY = y + (gridOffset % gridSize);
        ctx.beginPath();
        ctx.moveTo(0, offsetY);
        ctx.lineTo(canvas.width, offsetY);
        ctx.stroke();
      }

      // Energy wave effect
      ctx.strokeStyle = "rgba(212, 175, 55, 0.2)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#D4AF37";
      ctx.shadowBlur = 10;

      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 5) {
        const y =
          canvas.height * 0.5 +
          Math.sin((x + time * 100) * 0.01) * 50 +
          Math.sin((x + time * 150) * 0.005) * 30;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
};

export default ParticleBackground;
