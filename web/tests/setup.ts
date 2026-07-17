import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Polyfill matchMedia (manquant en jsdom)
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
