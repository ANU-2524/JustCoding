import React, { useEffect, useRef } from 'react';
import '../Style/Cursor.css';

const Cursor = () => {
  const containerRef = useRef(null);
  const coords = useRef({ x: 0, y: 0 });
  const circlesRef = useRef([]);

  useEffect(() => {
    // Disable custom cursor on touch devices
    const isTouchDevice = !window.matchMedia('(pointer: fine)').matches;
    if (isTouchDevice) {
return;
}

    const NUM_CIRCLES = 18; // Increased for a more fluid, energetic trail
    const container = containerRef.current;
    
    // Create circles
    const newCircles = [];
    for (let i = 0; i < NUM_CIRCLES; i++) {
      const circle = document.createElement("div");
      circle.className = "circle";
      if (i === 0) {
circle.classList.add("glow");
}
      
      const opacity = 1 - (i / NUM_CIRCLES);
      circle.style.opacity = (opacity * 0.8).toString(); // Brighter opacity
      
      container.appendChild(circle);
      
      newCircles.push({
        element: circle,
        x: 0,
        y: 0,
      });
    }
    circlesRef.current = newCircles;

    const handleMouseMove = (e) => {
      coords.current.x = e.clientX;
      coords.current.y = e.clientY;
    };

    const handleMouseDown = () => {
      circlesRef.current.forEach(c => c.element.classList.add('clicking'));
    };

    const handleMouseUp = () => {
      circlesRef.current.forEach(c => c.element.classList.remove('clicking'));
    };

    const handleMouseOver = (e) => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('a')) {
        circlesRef.current.forEach(c => c.element.classList.add('hovering'));
      } else {
        circlesRef.current.forEach(c => c.element.classList.remove('hovering'));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    let animationFrame;
    const animate = () => {
      let { x, y } = coords.current;

      circlesRef.current.forEach((circleData, index) => {
        const { element } = circleData;
        
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        
        const scale = (NUM_CIRCLES - index) / NUM_CIRCLES;
        element.style.transform = `translate(-50%, -50%) scale(${scale})`;
        
        circleData.x = x;
        circleData.y = y;

        const nextCircle = circlesRef.current[index + 1] || circlesRef.current[0];
        x += (nextCircle.x - x) * 0.5; // Snapier, more energetic follow speed
        y += (nextCircle.y - y) * 0.5;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(animationFrame);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return <div className="circle-container" ref={containerRef}></div>;
};

export default Cursor;
