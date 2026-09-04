import React, { useEffect, useRef } from "react";

const ParticlesBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const c = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < 80; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                });
            }
        };

        const animate = () => {
            c.fillStyle = "rgba(10, 15, 31, 0.25)";
            c.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

                c.fillStyle = "#6d28d9";
                c.beginPath();
                c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                c.fill();
            });

            requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        });
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 -z-10"
        ></canvas>
    );
};

export default ParticlesBackground;
