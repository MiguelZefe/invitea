"use client";

import { useEffect } from "react";

export default function BabyShowerEffects() {
  useEffect(() => {
    const invitation = document.querySelector<HTMLElement>(
      "[data-baby-invitation]"
    );

    if (!invitation) {
      return;
    }

    const revealElements = Array.from(
      invitation.querySelectorAll<HTMLElement>("[data-baby-reveal]")
    );
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => {
        element.dataset.babyVisible = "true";
      });
      return;
    }

    invitation.dataset.effectsReady = "true";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target as HTMLElement;
          element.dataset.babyVisible = "true";
          observer.unobserve(element);
        });
      },
      {
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.08,
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      delete invitation.dataset.effectsReady;
    };
  }, []);

  return null;
}
