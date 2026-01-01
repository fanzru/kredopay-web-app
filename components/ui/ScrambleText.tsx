"use client";

import React, { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const CHARS = "!@#$%^&*():{};|,.<>/?ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface ScrambleTextProps {
  text?: string;
  words?: string[]; // Array of words to cycle through
  className?: string;
  delay?: number;
  pauseDuration?: number; // How long to stay on a word
}

export function ScrambleText({
  text,
  words,
  className = "",
  delay = 0,
  pauseDuration = 2000,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(
    text || (words ? words[0] : "")
  );
  const [wordIndex, setWordIndex] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine current target text
  const targetText = words ? words[wordIndex] : text || "";

  useEffect(() => {
    if (!isInView) return;

    let pos = 0;
    const SHUFFLE_TIME = 30; // Faster updates (was 50)
    const CYCLES_PER_LETTER = 1; // Fewer cycles for snappier feel (was 2)

    const animate = () => {
      timeoutRef.current = setInterval(() => {
        const scrambled = targetText
          .split("")
          .map((char, index) => {
            if (pos / CYCLES_PER_LETTER > index) {
              return char;
            }
            const randomChar = CHARS[Math.floor(Math.random() * CHARS.length)];
            return randomChar;
          })
          .join("");

        setDisplayText(scrambled);
        pos++;

        if (pos >= targetText.length * CYCLES_PER_LETTER) {
          clearInterval(timeoutRef.current as any);
          setDisplayText(targetText);

          // If we have multiple words, queue the next one
          if (words && words.length > 1) {
            setTimeout(() => {
              setWordIndex((prev) => (prev + 1) % words.length);
            }, pauseDuration);
          }
        }
      }, SHUFFLE_TIME);
    };

    // Initial delay handling
    const startTimeout = setTimeout(() => {
      animate();
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [targetText, isInView, delay, words, pauseDuration]); // Re-run when targetText changes

  // Calculate max width to prevent layout shifts
  const maxLength = words
    ? Math.max(...words.map((w) => w.length))
    : text?.length || 0;

  // Approximate width based on font size (can be overridden by className)
  // For better precision, we use a hidden placeholder in a real implementation,
  // but here we'll use inline-block with min-width logic if possible,
  // or just rely on the user passing a className with width.
  // A simple fix is ensuring the span is inline-block and has a fixed width.

  return (
    <span
      ref={ref}
      className={`inline-block whitespace-nowrap ${className}`}
      style={{ width: `${maxLength}ch` }} // Rough fixed width using 'ch' unit
    >
      {displayText}
    </span>
  );
}
