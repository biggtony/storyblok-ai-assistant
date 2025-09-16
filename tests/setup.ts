import { vi } from "vitest"

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock window.navigator
Object.defineProperty(window, "navigator", {
  value: {
    userAgent: "test-agent",
  },
  writable: true,
})

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
  },
  writable: true,
})
