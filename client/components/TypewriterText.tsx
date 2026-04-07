import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Words to cycle through in the hero section
const WORDS = [
  "Handcrafted with Love",
  "Uniquely Yours",
  "Made by Artisans",
  "One of a Kind",
];

const TYPING_SPEED_MS = 80;   // ms per character when typing
const DELETING_SPEED_MS = 40; // ms per character when erasing
const PAUSE_MS = 1800;        // ms to pause after full word is typed

interface TypewriterTextProps {
  className?: string;
}

export function TypewriterText({ className }: TypewriterTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState(WORDS[0]);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(WORDS[0].length);
  const [phase, setPhase] = useState<"pause" | "deleting" | "typing">("pause");

  // If user prefers reduced motion, just render the first word statically
  if (prefersReducedMotion) {
    return <span className={className}>{WORDS[0]}</span>;
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "pause") {
      // Wait, then start deleting
      timer = setTimeout(() => setPhase("deleting"), PAUSE_MS);
    } else if (phase === "deleting") {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setCharIndex((c) => c - 1);
          setDisplayed(WORDS[wordIndex].slice(0, charIndex - 1));
        }, DELETING_SPEED_MS);
      } else {
        // Move to the next word and start typing
        const nextIndex = (wordIndex + 1) % WORDS.length;
        setWordIndex(nextIndex);
        setPhase("typing");
      }
    } else if (phase === "typing") {
      const target = WORDS[wordIndex];
      if (charIndex < target.length) {
        timer = setTimeout(() => {
          setCharIndex((c) => c + 1);
          setDisplayed(target.slice(0, charIndex + 1));
        }, TYPING_SPEED_MS);
      } else {
        // Finished typing — pause again
        setPhase("pause");
      }
    }

    return () => clearTimeout(timer);
  }, [phase, charIndex, wordIndex]);

  return (
    <span className={className}>
      {displayed}
      {/* Blinking cursor */}
      <span className="animate-pulse ml-0.5 text-primary/80">|</span>
    </span>
  );
}
