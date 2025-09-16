import { describe, it, expect, beforeEach, vi } from "vitest"
import { GeminiClient } from "../lib/gemini-client"

// Mock the Google Generative AI
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => "Generated content",
        },
      }),
    }),
  })),
}))

describe("GeminiClient", () => {
  let geminiClient: GeminiClient

  beforeEach(() => {
    geminiClient = new GeminiClient("test-api-key")
  })

  describe("generateContentBlock", () => {
    it("should generate content successfully", async () => {
      const context = {
        contentType: "paragraph",
        existingContent: "Test content",
        tone: "professional",
        style: "clear",
        length: "medium" as const,
      }

      const result = await geminiClient.generateContentBlock(context)

      expect(result.success).toBe(true)
      expect(result.content).toBe("Generated content")
      expect(result.suggestions).toBeDefined()
    })

    it("should handle API errors gracefully", async () => {
      // Mock API error
      const mockError = new Error("API Error")
      vi.mocked(geminiClient["textModel"].generateContent).mockRejectedValueOnce(mockError)

      const context = {
        contentType: "paragraph",
        existingContent: "Test content",
      }

      const result = await geminiClient.generateContentBlock(context)

      expect(result.success).toBe(false)
      expect(result.error).toBe("API Error")
      expect(result.fallback).toBeDefined()
    })

    it("should provide appropriate fallback content", async () => {
      const mockError = new Error("Network error")
      vi.mocked(geminiClient["textModel"].generateContent).mockRejectedValueOnce(mockError)

      const context = {
        contentType: "heading",
        existingContent: "",
      }

      const result = await geminiClient.generateContentBlock(context)

      expect(result.success).toBe(false)
      expect(result.fallback).toBe("Your Heading Here")
    })
  })

  describe("generateAltText", () => {
    it("should generate alt text for images", async () => {
      const imageData = "base64-encoded-image"
      const mimeType = "image/jpeg"

      const result = await geminiClient.generateAltText(imageData, mimeType)

      expect(result.success).toBe(true)
      expect(result.altText).toBe("Generated content")
      expect(result.confidence).toBe("high")
    })

    it("should handle vision API errors", async () => {
      const mockError = new Error("Vision API Error")
      vi.mocked(geminiClient["visionModel"].generateContent).mockRejectedValueOnce(mockError)

      const result = await geminiClient.generateAltText("image-data", "image/jpeg")

      expect(result.success).toBe(false)
      expect(result.error).toBe("Vision API Error")
      expect(result.fallback).toBe("Image description not available")
    })
  })

  describe("analyzeContentAccessibility", () => {
    it("should analyze content for accessibility issues", async () => {
      const content = "<h1>Title</h1><p>Content</p>"

      const result = await geminiClient.analyzeContentAccessibility(content)

      expect(result.success).toBe(true)
      expect(result.analysis).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })
  })
})
