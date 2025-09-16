import { describe, it, expect, beforeEach, vi } from "vitest"
import { AccessibilityChecker } from "../lib/accessibility-checker"
import type { GeminiClient } from "../lib/gemini-client"

// Mock GeminiClient
const mockGeminiClient = {
  generateAltText: vi.fn(),
  analyzeContentAccessibility: vi.fn(),
} as unknown as GeminiClient

describe("AccessibilityChecker", () => {
  let accessibilityChecker: AccessibilityChecker

  beforeEach(() => {
    accessibilityChecker = new AccessibilityChecker(mockGeminiClient)
    vi.clearAllMocks()
  })

  describe("checkContent", () => {
    it("should identify missing alt text", async () => {
      const content = '<img src="test.jpg">'
      const images = [{ src: "test.jpg" }]

      const result = await accessibilityChecker.checkContent(content, images)

      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: "alt-text",
          severity: "high",
          description: "Image missing alt text",
        }),
      )
    })

    it("should detect heading hierarchy issues", async () => {
      const content = "<h1>Title</h1><h3>Subtitle</h3>"

      const result = await accessibilityChecker.checkContent(content)

      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: "heading",
          severity: "medium",
          description: expect.stringContaining("Heading level skips"),
        }),
      )
    })

    it("should identify empty headings", async () => {
      const content = "<h1></h1><h2>Valid Heading</h2>"

      const result = await accessibilityChecker.checkContent(content)

      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: "heading",
          severity: "high",
          description: "Heading is empty",
        }),
      )
    })

    it("should calculate accessibility score correctly", async () => {
      const content = "<h1>Good Title</h1><p>Good content</p>"

      const result = await accessibilityChecker.checkContent(content)

      expect(result.score).toBeGreaterThan(80)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it("should provide actionable suggestions", async () => {
      const content = '<img src="test.jpg"><h1></h1>'
      const images = [{ src: "test.jpg" }]

      const result = await accessibilityChecker.checkContent(content, images)

      expect(result.suggestions).toContain("Add descriptive alt text for screen readers")
      expect(result.suggestions).toContain("Add descriptive text to the heading")
    })
  })

  describe("generateAltText", () => {
    it("should generate alt text using Gemini", async () => {
      const mockResult = {
        success: true,
        altText: "A beautiful sunset over mountains",
      }
      vi.mocked(mockGeminiClient.generateAltText).mockResolvedValue(mockResult)

      const result = await accessibilityChecker.generateAltText("image-data", "image/jpeg")

      expect(result).toBe("A beautiful sunset over mountains")
      expect(mockGeminiClient.generateAltText).toHaveBeenCalledWith("image-data", "image/jpeg")
    })

    it("should provide fallback when Gemini fails", async () => {
      const mockResult = {
        success: false,
        error: "API Error",
      }
      vi.mocked(mockGeminiClient.generateAltText).mockResolvedValue(mockResult)

      const result = await accessibilityChecker.generateAltText("image-data", "image/jpeg")

      expect(result).toBe("Image description not available")
    })
  })
})
