import { useEffect, useState } from "react";
import {
  FiEdit3,
  FiSearch,
  FiCpu,
  FiLock,
} from "react-icons/fi";
import "./FeatureCarousel.css";

const slides = [
  {
    type: "title",
    title: "Smart Notes",
    text: "A clean, intelligent note-taking experience built for focus.",
  },
  {
    title: "Focused Writing",
    icon: <FiEdit3 />,
    text: "Write without distractions in a minimal editor.",
  },
  {
    title: "Instant Search",
    icon: <FiSearch />,
    text: "Find any note instantly with smart indexing.",
  },
  {
    title: "Smart Features",
    icon: <FiCpu />,
    text: "AI-powered features coming soon.",
  },
  {
    title: "Privacy First",
    icon: <FiLock />,
    text: "Your notes stay private and secure.",
  },
];

export default function FeatureCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      3600
    );
    return () => clearInterval(interval);
  }, []);

  const slide = slides[index];

  return (
    <div className="carousel">
      <div className="carousel-frame">
        <div key={index} className="carousel-slide">
          {slide.icon && (
            <div className="carousel-icon">{slide.icon}</div>
          )}

          <h2 className={slide.type === "title" ? "app-title" : ""}>
            {slide.title}
          </h2>

          <p>{slide.text}</p>
        </div>
      </div>

      <div className="carousel-dots">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
