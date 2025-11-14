import { motion } from 'framer-motion';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    delay: Math.random() * 5,
    duration: Math.random() * 20 + 15,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <div className="animated-background">
      {/* Gradient layers with animation */}
      <div className="gradient-layer gradient-layer-1"></div>
      <div className="gradient-layer gradient-layer-2"></div>
      <div className="gradient-layer gradient-layer-3"></div>

      {/* Floating particles */}
      <div className="particles-container">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="particle"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Mesh gradient overlay */}
      <div className="mesh-overlay"></div>
    </div>
  );
};

export default AnimatedBackground;
