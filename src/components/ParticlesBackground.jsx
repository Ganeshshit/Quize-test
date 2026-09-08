// src/components/trainer/quiz/ParticlesBackground.jsx
import React, { useEffect, useRef } from "react";

const ParticlesBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const c = canvas.getContext("2d");
        let animationFrameId;

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        setCanvasSize();

        let particles = [];
        // Premium palette: Primary Yellow, Soft White, and Muted Gray
        const colors = ['#FACC15', '#FFFFFF', '#333333'];

        const initParticles = () => {
            particles = [];
            // Slightly reduced particle count for a cleaner, less cluttered enterprise look
            for (let i = 0; i < 60; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.4,
                    speedY: (Math.random() - 0.5) * 0.4,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        };

        const animate = () => {
            // Trail effect matching the #0A0A0A dark theme
            c.fillStyle = "rgba(10, 10, 10, 0.25)";
            c.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.x += p.speedX;
                p.y += p.speedY;

                // Bounce off edges smoothly
                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

                c.fillStyle = p.color;
                c.beginPath();
                c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                c.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        const handleResize = () => {
            setCanvasSize();
            initParticles();
        };

        window.addEventListener("resize", handleResize);

        // Cleanup to prevent memory leaks
        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 -z-10 bg-[#0A0A0A]"
        ></canvas>
    );
};

export default ParticlesBackground;