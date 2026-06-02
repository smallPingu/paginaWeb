/**
 * GSAP Animation Suite — reusable animation controllers
 *
 * Import this module in any Astro page/component that needs GSAP animations.
 * Tools are self-contained and clean up after themselves.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Hero Animation ─────────────────────────────────────── */

export function animateHero(container) {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo(
    container.querySelector('[data-hero-badge]'),
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6 }
  )
  .fromTo(
    container.querySelector('[data-hero-title]'),
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.8 },
    '-=0.3'
  )
  .fromTo(
    container.querySelector('[data-hero-subtitle]'),
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.6 },
    '-=0.4'
  )
  .fromTo(
    container.querySelector('[data-hero-cta]'),
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5 },
    '-=0.2'
  )
  .fromTo(
    container.querySelector('[data-hero-image]'),
    { opacity: 0, scale: 1.1 },
    { opacity: 1, scale: 1, duration: 1.0 },
    '-=0.8'
  );

  return tl;
}

/* ─── Reveal on Scroll (triggered by IntersectionObserver fallback) ── */

export function animateReveal(elements, options = {}) {
  if (!elements || elements.length === 0) return;

  const els = elements instanceof NodeList ? Array.from(elements) :
              Array.isArray(elements) ? elements : [elements];

  els.forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: options.y ?? 40 },
      {
        opacity: 1,
        y: 0,
        duration: options.duration ?? 0.7,
        delay: i * (options.stagger ?? 0.12),
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: options.start ?? 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
      }
    );
  });
}

/* ─── Gallery grid stagger animation ─────────────────────── */

export function animateGalleryGrid(container, options = {}) {
  const items = container.querySelectorAll('[data-gallery-item]');
  if (items.length === 0) return;

  gsap.fromTo(
    items,
    { opacity: 0, y: 40, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: options.duration ?? 0.6,
      stagger: options.stagger ?? 0.08,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true,
      },
    }
  );
}

/* ─── Parallax on scroll ─────────────────────────────────── */

export function animateParallax(container, { speed = 0.3 } = {}) {
  const el = container instanceof Element ? container :
             document.querySelector(container);

  if (!el) return;

  gsap.fromTo(
    el,
    { y: 0 },
    {
      y: () => el.offsetHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement || el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    }
  );
}

/* ─── Floating shapes (hero decoration) ──────────────────── */

export function animateFloatingShapes(container) {
  const shapes = container.querySelectorAll('[data-float]');
  if (shapes.length === 0) return;

  shapes.forEach((shape) => {
    gsap.to(shape, {
      y: () => gsap.utils.random(-15, 15),
      x: () => gsap.utils.random(-10, 10),
      rotate: () => gsap.utils.random(-5, 5),
      duration: () => gsap.utils.random(3, 5),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: () => gsap.utils.random(0, 2),
    });
  });
}

/* ─── Counter animation (for stats) ──────────────────────── */

export function animateCounter(element, { start = 0, end, duration = 2 }) {
  if (!element) return;

  const obj = { val: start };
  gsap.to(obj, {
    val: end,
    duration,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      once: true,
    },
    onUpdate: () => {
      element.textContent = Math.round(obj.val);
    },
  });
}

/* ─── Cleanup all ScrollTriggers ─────────────────────────── */

export function cleanup() {
  ScrollTrigger.getAll().forEach((st) => st.kill());
}

/* ─── Section divider curve ──────────────────────────────── */

export function animateSectionDivider(svgElement) {
  if (!svgElement) return;

  const path = svgElement.querySelector('path');
  if (!path) return;

  const length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

  gsap.to(path, {
    strokeDashoffset: 0,
    duration: 1.5,
    ease: 'power2.inOut',
    scrollTrigger: {
      trigger: svgElement,
      start: 'top 90%',
      once: true,
    },
  });
}
