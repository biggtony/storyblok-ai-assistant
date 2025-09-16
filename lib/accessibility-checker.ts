import type { GeminiClient } from "./gemini-client"
import Color from "color"
import { WCAGValidator } from "./wcag-validator"
import { ImageAnalyzer } from "./image-analyzer"

export interface AccessibilityIssue {
  id: string
  type: "alt-text" | "contrast" | "heading" | "aria" | "semantic"
  severity: "high" | "medium" | "low"
  element: string
  description: string
  recommendation: string
  autoFixable: boolean
}

export class AccessibilityChecker {
  private geminiClient: GeminiClient
  private wcagValidator: WCAGValidator
  private imageAnalyzer: ImageAnalyzer

  constructor(geminiClient: GeminiClient) {
    this.geminiClient = geminiClient
    this.wcagValidator = new WCAGValidator()
    this.imageAnalyzer = new ImageAnalyzer(geminiClient)
  }

  async checkContent(
    content: string,
    images?: Array<{ src: string; alt?: string; data?: string; mimeType?: string }>,
  ): Promise<{
    score: number
    issues: AccessibilityIssue[]
    suggestions: string[]
    imageAnalyses?: Array<{ src: string; analysis: any }>
  }> {
    const issues: AccessibilityIssue[] = []
    const imageAnalyses: Array<{ src: string; analysis: any }> = []

    // Run WCAG validation
    const wcagResults = this.wcagValidator.validateContent(content, images || [])

    // Convert WCAG results to our issue format
    wcagResults.forEach((result, index) => {
      if (!result.passed) {
        issues.push({
          id: `wcag-${result.ruleId}-${index}`,
          type: this.mapWCAGRuleToType(result.ruleId),
          severity: result.severity,
          element: result.element || "Content element",
          description: result.message,
          recommendation: result.suggestion,
          autoFixable: result.autoFixable,
        })
      }
    })

    // Enhanced image analysis
    if (images) {
      for (const [index, image] of images.entries()) {
        if (image.data && image.mimeType) {
          try {
            const analysis = await this.imageAnalyzer.analyzeImage(
              image.data,
              image.mimeType,
              this.extractImageContext(content, image.src),
            )

            imageAnalyses.push({
              src: image.src,
              analysis,
            })

            // Generate issues based on analysis
            if (!image.alt && !analysis.decorative) {
              issues.push({
                id: `ai-alt-text-${index}`,
                type: "alt-text",
                severity: "high",
                element: `Image ${index + 1}`,
                description: "Image missing alt text (AI analysis suggests it's informative)",
                recommendation: `Suggested alt text: "${analysis.altText}"`,
                autoFixable: true,
              })
            }

            if (analysis.accessibility.hasText && !this.hasTextAlternative(content, image.src)) {
              issues.push({
                id: `text-in-image-${index}`,
                type: "alt-text",
                severity: "high",
                element: `Image ${index + 1}`,
                description: "Image contains text but no text alternative is provided",
                recommendation: `Provide text alternative: "${analysis.textContent}"`,
                autoFixable: true,
              })
            }

            if (analysis.accessibility.needsLongDescription) {
              issues.push({
                id: `complex-image-${index}`,
                type: "alt-text",
                severity: "medium",
                element: `Image ${index + 1}`,
                description: "Complex image may need long description",
                recommendation:
                  analysis.accessibility.suggestedLongDescription || "Consider adding a detailed description",
                autoFixable: false,
              })
            }
          } catch (error) {
            console.warn(`Failed to analyze image ${index}:`, error)
          }
        }
      }
    }

    // Check heading structure
    const headingIssues = this.checkHeadingStructure(content)
    issues.push(...headingIssues)

    // Check color contrast (basic implementation)
    const contrastIssues = this.checkColorContrast(content)
    issues.push(...contrastIssues)

    // Use Gemini for advanced content analysis
    try {
      const geminiAnalysis = await this.geminiClient.analyzeContentAccessibility(content, [])
      if (geminiAnalysis.success && geminiAnalysis.analysis.issues) {
        const geminiIssues = this.convertGeminiAnalysisToIssues(geminiAnalysis.analysis)
        issues.push(...geminiIssues)
      }
    } catch (error) {
      console.warn("Gemini accessibility analysis failed, using fallback checks")
    }

    const score = this.wcagValidator.calculateScore(wcagResults)
    const suggestions = this.generateEnhancedSuggestions(issues, imageAnalyses)

    return { score, issues, suggestions, imageAnalyses }
  }

  async generateAltText(imageData: string, mimeType: string): Promise<string> {
    const result = await this.geminiClient.generateAltText(imageData, mimeType)
    return result.success ? result.altText : "Image description not available"
  }

  private checkHeadingStructure(content: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
    const headings: Array<{ level: number; text: string; index: number }> = []

    let match
    let index = 0
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        level: Number.parseInt(match[1]),
        text: match[2].replace(/<[^>]*>/g, "").trim(),
        index: index++,
      })
    }

    // Check for proper heading hierarchy
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i]
      const previous = headings[i - 1]

      if (current.level > previous.level + 1) {
        issues.push({
          id: `heading-skip-${i}`,
          type: "heading",
          severity: "medium",
          element: `Heading ${i + 1}`,
          description: `Heading level skips from h${previous.level} to h${current.level}`,
          recommendation: `Use h${previous.level + 1} instead of h${current.level}`,
          autoFixable: true,
        })
      }
    }

    // Check for empty headings
    headings.forEach((heading, index) => {
      if (!heading.text || heading.text.length === 0) {
        issues.push({
          id: `heading-empty-${index}`,
          type: "heading",
          severity: "high",
          element: `Heading ${index + 1}`,
          description: "Heading is empty",
          recommendation: "Add descriptive text to the heading",
          autoFixable: false,
        })
      }
    })

    return issues
  }

  private checkColorContrast(content: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Basic color contrast checking for inline styles
    const colorRegex = /style="[^"]*color:\s*([^;]+)[^"]*"/gi
    const backgroundRegex = /style="[^"]*background-color:\s*([^;]+)[^"]*"/gi

    let match
    let index = 0
    while ((match = colorRegex.exec(content)) !== null) {
      try {
        const color = Color(match[1].trim())
        // This is a simplified check - in practice, you'd need to check against background colors
        if (color.luminosity() < 0.3) {
          issues.push({
            id: `contrast-${index++}`,
            type: "contrast",
            severity: "medium",
            element: "Text element",
            description: "Potential color contrast issue detected",
            recommendation: "Verify color contrast meets WCAG AA standards (4.5:1 ratio)",
            autoFixable: false,
          })
        }
      } catch (error) {
        // Invalid color format
      }
    }

    return issues
  }

  private convertGeminiAnalysisToIssues(analysis: any): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    if (analysis.issues && Array.isArray(analysis.issues)) {
      analysis.issues.forEach((issue: any, index: number) => {
        issues.push({
          id: `gemini-${index}`,
          type: issue.type || "semantic",
          severity: issue.severity,
          element: issue.element || "Content element",
          description: issue.description || "Accessibility issue detected",
          recommendation: issue.recommendation || "Review and fix accessibility issue",
          autoFixable: issue.autoFixable || false,
        })
      })
    }

    return issues
  }

  private mapWCAGRuleToType(ruleId: string): AccessibilityIssue["type"] {
    const mapping: Record<string, AccessibilityIssue["type"]> = {
      "1.1.1": "alt-text",
      "1.4.3": "contrast",
      "1.3.1": "semantic",
      "2.4.6": "heading",
      "4.1.2": "aria",
    }
    return mapping[ruleId] || "semantic"
  }

  private extractImageContext(content: string, imageSrc: string): string {
    // Extract surrounding text context for the image
    const imgRegex = new RegExp(`<img[^>]*src=["']${imageSrc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i")
    const match = content.match(imgRegex)

    if (match) {
      const imgIndex = content.indexOf(match[0])
      const contextStart = Math.max(0, imgIndex - 200)
      const contextEnd = Math.min(content.length, imgIndex + match[0].length + 200)
      return content
        .substring(contextStart, contextEnd)
        .replace(/<[^>]*>/g, " ")
        .trim()
    }

    return ""
  }

  private hasTextAlternative(content: string, imageSrc: string): boolean {
    // Check if there's a text alternative near the image
    const context = this.extractImageContext(content, imageSrc)
    return context.length > 50 // Simple heuristic
  }

  private generateEnhancedSuggestions(
    issues: AccessibilityIssue[],
    imageAnalyses: Array<{ src: string; analysis: any }>,
  ): string[] {
    const suggestions = new Set<string>()

    // Add base suggestions
    issues.forEach((issue) => {
      suggestions.add(issue.recommendation)
    })

    // Add AI-powered suggestions
    const issueTypes = new Set(issues.map((issue) => issue.type))

    if (issueTypes.has("alt-text")) {
      suggestions.add("Use AI-generated alt text as a starting point, then refine for your specific context")

      const decorativeImages = imageAnalyses.filter((img) => img.analysis.decorative)
      if (decorativeImages.length > 0) {
        suggestions.add(
          `${decorativeImages.length} image(s) appear decorative - consider using empty alt text (alt="")`,
        )
      }
    }

    if (issueTypes.has("contrast")) {
      suggestions.add("Use a color contrast checker tool to verify all text meets WCAG AA standards")
    }

    if (issueTypes.has("heading")) {
      suggestions.add("Structure headings hierarchically (H1 → H2 → H3) to create a logical document outline")
    }

    // Add specific suggestions based on image analysis
    const textInImages = imageAnalyses.filter((img) => img.analysis.accessibility?.hasText)
    if (textInImages.length > 0) {
      suggestions.add("Consider replacing text-in-images with actual HTML text for better accessibility")
    }

    const complexImages = imageAnalyses.filter((img) => img.analysis.accessibility?.needsLongDescription)
    if (complexImages.length > 0) {
      suggestions.add("Complex images (charts, diagrams) should include detailed descriptions or data tables")
    }

    return Array.from(suggestions)
  }
}
