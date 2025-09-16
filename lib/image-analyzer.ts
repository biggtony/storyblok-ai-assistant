import type { GeminiClient } from "./gemini-client"

export interface ImageAnalysis {
  altText: string
  confidence: "high" | "medium" | "low"
  description: string
  context: string
  decorative: boolean
  textContent?: string
  accessibility: {
    hasText: boolean
    isComplex: boolean
    needsLongDescription: boolean
    suggestedLongDescription?: string
  }
}

export class ImageAnalyzer {
  private geminiClient: GeminiClient

  constructor(geminiClient: GeminiClient) {
    this.geminiClient = geminiClient
  }

  async analyzeImage(imageData: string, mimeType: string, context?: string): Promise<ImageAnalysis> {
    try {
      const analysisPrompt = this.buildAnalysisPrompt(context)

      const imagePart = {
        inlineData: {
          data: imageData,
          mimeType: mimeType,
        },
      }

      const result = await this.geminiClient.visionModel.generateContent([analysisPrompt, imagePart])
      const response = await result.response
      const analysisText = response.text()

      return this.parseAnalysisResponse(analysisText)
    } catch (error) {
      console.error("Image analysis error:", error)
      return this.getFallbackAnalysis()
    }
  }

  async generateContextualAltText(
    imageData: string,
    mimeType: string,
    surroundingContent: string,
    imageContext: "decorative" | "informative" | "functional",
  ): Promise<string> {
    try {
      const prompt = this.buildContextualPrompt(surroundingContent, imageContext)

      const imagePart = {
        inlineData: {
          data: imageData,
          mimeType: mimeType,
        },
      }

      const result = await this.geminiClient.visionModel.generateContent([prompt, imagePart])
      const response = await result.response

      return this.cleanAltText(response.text())
    } catch (error) {
      console.error("Contextual alt text generation error:", error)
      return "Image description not available"
    }
  }

  async detectTextInImage(
    imageData: string,
    mimeType: string,
  ): Promise<{
    hasText: boolean
    extractedText?: string
    confidence: number
  }> {
    try {
      const prompt = `Analyze this image and extract any text content you can see. 
      If there is text, provide the exact text content. 
      If there is no readable text, respond with "NO_TEXT_FOUND".
      Also indicate your confidence level in the text extraction (0-100).`

      const imagePart = {
        inlineData: {
          data: imageData,
          mimeType: mimeType,
        },
      }

      const result = await this.geminiClient.visionModel.generateContent([prompt, imagePart])
      const response = await result.response
      const responseText = response.text()

      if (responseText.includes("NO_TEXT_FOUND")) {
        return {
          hasText: false,
          confidence: 90,
        }
      }

      // Extract confidence score if provided
      const confidenceMatch = responseText.match(/confidence[:\s]*(\d+)/i)
      const confidence = confidenceMatch ? Number.parseInt(confidenceMatch[1]) : 75

      return {
        hasText: true,
        extractedText: responseText.replace(/confidence[:\s]*\d+/i, "").trim(),
        confidence,
      }
    } catch (error) {
      console.error("Text detection error:", error)
      return {
        hasText: false,
        confidence: 0,
      }
    }
  }

  async isImageDecorative(imageData: string, mimeType: string, context: string): Promise<boolean> {
    try {
      const prompt = `Analyze this image in the context of the following content: "${context}"
      
      Determine if this image is:
      1. Decorative (purely aesthetic, doesn't add information)
      2. Informative (conveys important information)
      3. Functional (serves a specific purpose like navigation)
      
      Respond with only "DECORATIVE", "INFORMATIVE", or "FUNCTIONAL".`

      const imagePart = {
        inlineData: {
          data: imageData,
          mimeType: mimeType,
        },
      }

      const result = await this.geminiClient.visionModel.generateContent([prompt, imagePart])
      const response = await result.response

      return response.text().trim().toUpperCase() === "DECORATIVE"
    } catch (error) {
      console.error("Decorative image detection error:", error)
      return false // Default to informative to be safe
    }
  }

  private buildAnalysisPrompt(context?: string): string {
    return `Analyze this image comprehensively and provide the following information in JSON format:

    {
      "altText": "Concise alt text (under 125 characters)",
      "confidence": "high|medium|low",
      "description": "Detailed description of the image",
      "context": "How this image relates to the content context",
      "decorative": true/false,
      "textContent": "Any text visible in the image (if any)",
      "accessibility": {
        "hasText": true/false,
        "isComplex": true/false,
        "needsLongDescription": true/false,
        "suggestedLongDescription": "Detailed description if complex"
      }
    }

    ${context ? `Content context: ${context}` : ""}

    Focus on accessibility and ensure the alt text is meaningful for screen reader users.`
  }

  private buildContextualPrompt(surroundingContent: string, imageContext: string): string {
    const contextInstructions = {
      decorative:
        "This image is decorative. Generate very brief alt text or suggest empty alt text if purely decorative.",
      informative:
        "This image conveys important information. Generate descriptive alt text that captures the essential information.",
      functional:
        "This image serves a functional purpose (like navigation or interaction). Focus on the function in the alt text.",
    }

    return `Generate alt text for this image in the context of the following content:

    "${surroundingContent}"

    Image context: ${imageContext}
    Instructions: ${contextInstructions[imageContext as keyof typeof contextInstructions]}

    Provide only the alt text, nothing else. Keep it under 125 characters and make it meaningful for screen readers.`
  }

  private parseAnalysisResponse(responseText: string): ImageAnalysis {
    try {
      // Try to parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          altText: parsed.altText || "Image description not available",
          confidence: parsed.confidence || "medium",
          description: parsed.description || "No description available",
          context: parsed.context || "No context provided",
          decorative: parsed.decorative || false,
          textContent: parsed.textContent,
          accessibility: parsed.accessibility || {
            hasText: false,
            isComplex: false,
            needsLongDescription: false,
          },
        }
      }

      // Fallback text parsing
      return this.parseTextResponse(responseText)
    } catch (error) {
      console.error("Failed to parse analysis response:", error)
      return this.getFallbackAnalysis()
    }
  }

  private parseTextResponse(responseText: string): ImageAnalysis {
    const lines = responseText.split("\n").filter((line) => line.trim())

    return {
      altText: this.extractValue(lines, "alt") || "Image description not available",
      confidence: (this.extractValue(lines, "confidence") as any) || "medium",
      description: this.extractValue(lines, "description") || "No description available",
      context: this.extractValue(lines, "context") || "No context provided",
      decorative: this.extractValue(lines, "decorative") === "true",
      textContent: this.extractValue(lines, "text"),
      accessibility: {
        hasText: this.extractValue(lines, "hasText") === "true",
        isComplex: this.extractValue(lines, "complex") === "true",
        needsLongDescription: this.extractValue(lines, "longDescription") === "true",
      },
    }
  }

  private extractValue(lines: string[], key: string): string | undefined {
    const line = lines.find((l) => l.toLowerCase().includes(key.toLowerCase()))
    if (line) {
      const colonIndex = line.indexOf(":")
      if (colonIndex !== -1) {
        return line
          .substring(colonIndex + 1)
          .trim()
          .replace(/['"]/g, "")
      }
    }
    return undefined
  }

  private cleanAltText(altText: string): string {
    return altText
      .trim()
      .replace(/^["']|["']$/g, "") // Remove quotes
      .replace(/^alt text:?\s*/i, "") // Remove "alt text:" prefix
      .replace(/\.$/, "") // Remove trailing period
      .substring(0, 125) // Ensure max length
  }

  private getFallbackAnalysis(): ImageAnalysis {
    return {
      altText: "Image description not available",
      confidence: "low",
      description: "Unable to analyze image",
      context: "Analysis failed",
      decorative: false,
      accessibility: {
        hasText: false,
        isComplex: false,
        needsLongDescription: false,
      },
    }
  }
}
