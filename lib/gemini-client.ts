import { GoogleGenerativeAI } from "@google/generative-ai"

export class GeminiClient {
  private genAI: GoogleGenerativeAI
  private textModel: any
  private visionModel: any

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.textModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    this.visionModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  }

  async generateContentBlock(context: {
    contentType: string
    existingContent: string
    tone?: string
    style?: string
    length?: "short" | "medium" | "long"
  }) {
    try {
      const prompt = this.buildContentPrompt(context)
      const result = await this.textModel.generateContent(prompt)
      const response = await result.response
      return {
        success: true,
        content: response.text(),
        suggestions: this.parseContentSuggestions(response.text()),
      }
    } catch (error) {
      console.error("Gemini content generation error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: this.getFallbackContent(context.contentType),
      }
    }
  }

  async generateAltText(imageData: string, mimeType: string) {
    try {
      const prompt = `Analyze this image and generate a concise, descriptive alt text that would be helpful for screen readers. Focus on the main subject, important details, and context. Keep it under 125 characters.`

      const imagePart = {
        inlineData: {
          data: imageData,
          mimeType: mimeType,
        },
      }

      const result = await this.visionModel.generateContent([prompt, imagePart])
      const response = await result.response

      return {
        success: true,
        altText: response.text().trim(),
        confidence: "high",
      }
    } catch (error) {
      console.error("Gemini alt text generation error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: "Image description not available",
      }
    }
  }

  async analyzeContentAccessibility(content: string, images?: Array<{ data: string; mimeType: string }>) {
    try {
      const prompt = `Analyze this content for WCAG 2.1 Level AA accessibility compliance. Check for:
      1. Heading structure and hierarchy
      2. Link text descriptiveness  
      3. Text readability and structure
      4. Missing ARIA attributes
      
      Content: ${content}
      
      Provide specific, actionable recommendations in JSON format with severity levels (high, medium, low).`

      const result = await this.textModel.generateContent(prompt)
      const response = await result.response

      return {
        success: true,
        analysis: this.parseAccessibilityAnalysis(response.text()),
        score: this.calculateAccessibilityScore(response.text()),
      }
    } catch (error) {
      console.error("Gemini accessibility analysis error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private buildContentPrompt(context: any): string {
    const { contentType, existingContent, tone = "professional", style = "clear", length = "medium" } = context

    return `Generate a ${contentType} content block with the following requirements:
    - Tone: ${tone}
    - Style: ${style}  
    - Length: ${length}
    - Context: ${existingContent ? `Building on: ${existingContent}` : "New content"}
    
    Provide 2-3 variations and ensure the content is engaging, accessible, and fits the specified parameters.`
  }

  private parseContentSuggestions(text: string) {
    // Parse AI response into structured suggestions
    const lines = text.split("\n").filter((line) => line.trim())
    return lines.map((line, index) => ({
      id: `suggestion-${index}`,
      content: line.trim(),
      type: "text",
      confidence: "medium",
    }))
  }

  private parseAccessibilityAnalysis(text: string) {
    try {
      // Try to parse JSON response, fallback to text parsing
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // Fallback text parsing
      return {
        issues: [],
        recommendations: text.split("\n").filter((line) => line.trim()),
        severity: "medium",
      }
    } catch {
      return {
        issues: [],
        recommendations: ["Unable to parse accessibility analysis"],
        severity: "low",
      }
    }
  }

  private calculateAccessibilityScore(analysis: string): number {
    // Simple scoring based on number of issues mentioned
    const issueKeywords = ["error", "missing", "invalid", "poor", "fail"]
    const issueCount = issueKeywords.reduce(
      (count, keyword) => count + (analysis.toLowerCase().split(keyword).length - 1),
      0,
    )

    return Math.max(0, 100 - issueCount * 10)
  }

  private getFallbackContent(contentType: string): string {
    const fallbacks = {
      heading: "Your Heading Here",
      paragraph: "This is a placeholder paragraph. Replace with your content.",
      list: "• First item\n• Second item\n• Third item",
      quote: '"This is a sample quote that demonstrates the format."',
    }

    return fallbacks[contentType as keyof typeof fallbacks] || "Content placeholder"
  }
}
