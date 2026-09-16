import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  RotateCcw, 
  Maximize2, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const [isRotatingFast, setIsRotatingFast] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });
  
  const stageRef = useRef(null);
  const clusterRef = useRef(null);

  // Generate 150 points uniformly distributed on a 3D sphere using Fibonacci algorithm
  const sphereBeads = useMemo(() => {
    const count = 160;
    const phi = Math.PI * (Math.sqrt(5) - 1); // Golden angle (~2.39996 rad)
    const radius = 175; // Base radius in pixels

    return Array.from({ length: count }, (_, i) => {
      const y = 1 - (i / (count - 1)) * 2; // y ranges from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Calculate bead diameter (20px to 25px with subtle depth variance)
      const size = 21 + ((z + 1) / 2) * 4;

      return {
        id: i,
        x: Math.round(x * radius),
        y: Math.round(y * radius),
        z: Math.round(z * radius),
        size: Math.round(size),
      };
    });
  }, []);

  // Smooth 60fps cursor parallax listener
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let rafId = null;
    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

        // Limit tilt to comfortable natural angles
        const tiltX = Math.max(-1, Math.min(1, normX)) * 22;
        const tiltY = Math.max(-1, Math.min(1, normY)) * -22;

        if (clusterRef.current) {
          clusterRef.current.style.transform = `rotateY(${tiltX}deg) rotateX(${tiltY}deg)`;
        }
      });
    };

    const handleMouseLeave = () => {
      if (clusterRef.current) {
        clusterRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    stage.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      stage.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="landing-root">
      
      {/* ============================================================ */}
      {/* TOP NAVIGATION BAR                                           */}
      {/* ============================================================ */}
      <header className="landing-nav">
        {/* Brand Logo / Wordmark */}
        <Link to="/" className="landing-nav-brand">
          <div className="landing-audio-icon">
            <span className="landing-audio-bar" />
            <span className="landing-audio-bar" />
            <span className="landing-audio-bar" />
            <span className="landing-audio-bar" />
          </div>
          <div className="landing-brand-name">
            Skill<span>Sync</span>
          </div>
        </Link>

        {/* Right Nav Action */}
        <div className="landing-nav-actions">
          <div className="landing-nav-badge">
            <ShieldCheck size={13} color="#34d399" />
            <span>AI Skill Alignment</span>
          </div>

          <Link to="/login" className="landing-nav-btn">
            Sign In
          </Link>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION (Split Layout)                                  */}
      {/* ============================================================ */}
      <main className="landing-hero">
        
        {/* LEFT CONTENT AREA */}
        <motion.div 
          className="landing-hero-left"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Main Headline */}
          <h1 className="landing-hero-headline">
            Bridge the<br />
            Skill Gap<br />
            <span className="landing-headline-accent">with AI.</span>
          </h1>

          {/* Subheading Copy */}
          <p className="landing-hero-subheading">
            Bridge the curriculum gap with predictive skill intelligence. No extra setup, just continuous alignment between academia and industry readiness.
          </p>

          {/* Primary CTA Button */}
          <div>
            <Link to="/login" className="landing-cta-btn">
              <span>EXPLORE THE PRODUCT</span>
              <ArrowRight size={17} className="landing-cta-arrow" />
            </Link>
          </div>
        </motion.div>

        {/* RIGHT VISUAL AREA (Clustered 3D Spherical Geometry) */}
        <motion.div 
          className="landing-hero-right"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div 
            ref={stageRef} 
            className={`sphere-viewport ${isExpanded ? 'scale-105' : ''}`}
          >
            {/* Top-Right Control Buttons */}
            <div className="sphere-controls">
              <button
                type="button"
                onClick={() => setIsRotatingFast(!isRotatingFast)}
                className="sphere-control-btn"
                title="Toggle rotation speed"
                aria-label="Toggle rotation speed"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="sphere-control-btn"
                title="Toggle expand view"
                aria-label="Toggle expand view"
              >
                <Maximize2 size={15} />
              </button>
            </div>

            {/* Ambient Back Glow */}
            <div className="sphere-ambient-glow" />

            {/* 3D Parallax Tilt Anchor */}
            <div ref={clusterRef} className="sphere-cluster-3d">
              {/* Continuous 360 Spin Container */}
              <div 
                className={`sphere-rotating-wrapper ${isRotatingFast ? 'fast' : ''}`}
                style={{
                  transform: isExpanded ? 'scale3d(1.1, 1.1, 1.1)' : 'scale3d(1, 1, 1)',
                  transition: 'transform 0.4s ease-out'
                }}
              >
                {sphereBeads.map((bead) => (
                  <div
                    key={bead.id}
                    className="sphere-bead"
                    style={{
                      width: `${bead.size}px`,
                      height: `${bead.size}px`,
                      transform: `translate3d(${bead.x}px, ${bead.y}px, ${bead.z}px)`,
                      background: `radial-gradient(circle at 35% 28%, #6ee7b7 0%, #10b981 22%, #0b3a24 50%, #051910 75%, #020905 100%)`,
                      boxShadow: `
                        inset -2px -2px 5px rgba(0, 0, 0, 0.85),
                        inset 1px 1px 3px rgba(167, 243, 208, 0.45),
                        0 0 6px rgba(16, 185, 129, 0.12)
                      `,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Interaction Caption */}
          <div className="sphere-caption">
            <span className="sphere-caption-dot" />
            <span>Move your cursor to explore</span>
          </div>
        </motion.div>

      </main>

      {/* Ambient Bottom Glow Line */}
      <div className="landing-bottom-glow" />

    </div>
  );
}
