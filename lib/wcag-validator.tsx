import Color from "color"

export interface WCAGRule {
  id: string
  name: string
  level: "A" | "AA" | "AAA"
  category: "perceivable" | "operable" | "understandable" | "robust"
  description: string
}

export interface ValidationResult {
  ruleId: string
  passed: boolean
  severity: "high" | "medium" | "low"
  element?: string
  message: string
  suggestion: string
  autoFixable: boolean
}

export class WCAGValidator {
  private rules: WCAGRule[] = [
    {
      id: "1.1.1",
      name: "Non-text Content",
      level: "A",
      category: "perceivable",
      description: "All non-text content has a text alternative",
    },
    {
      id: "1.4.3",
      name: "Contrast (Minimum)",
      level: "AA",
      category: "perceivable",
      description: "Text has a contrast ratio of at least 4.5:1",
    },
    {
      id: "1.3.1",
      name: "Info and Relationships",
      level: "A",
      category: "perceivable",
      description: "Information and relationships are programmatically determinable",
    },
    {
      id: "2.4.6",
      name: "Headings and Labels",
      level: "AA",
      category: "operable",
      description: "Headings and labels describe topic or purpose",
    },
    {
      id: "4.1.2",
      name: "Name, Role, Value",
      level: "A",
      category: "robust",
      description: "Name and role can be programmatically determined",
    },
  ]

  validateContent(content: string, images: Array<{ src: string; alt?: string }>): ValidationResult[] {
    const results: ValidationResult[] = []

    // Validate images (1.1.1)
    results.push(...this.validateImages(images))

    // Validate headings (1.3.1, 2.4.6)
    results.push(...this.validateHeadings(content))

    // Validate color contrast (1.4.3)
    results.push(...this.validateColorContrast(content))

    // Validate semantic structure (1.3.1)
    results.push(...this.validateSemanticStructure(content))

    // Validate ARIA attributes (4.1.2)
    results.push(...this.validateARIA(content))

    return results
  }

  private validateImages(images: Array<{ src: string; alt?: string }>): ValidationResult[] {
    const results: ValidationResult[] = []

    images.forEach((image, index) => {
      const element = `Image ${index + 1} (${image.src})`

      if (!image.alt || image.alt.trim().length === 0) {
        results.push({
          ruleId: "1.1.1",
          passed: false,
          severity: "high",
          element,
          message: "Image is missing alt text",
          suggestion: "Add descriptive alt text that conveys the purpose and content of the image",
          autoFixable: true,
        })
      } else if (image.alt.length > 125) {
        results.push({
          ruleId: "1.1.1",
          passed: false,
          severity: "medium",
          element,
          message: "Alt text is too long (over 125 characters)",
          suggestion: "Shorten alt text while maintaining essential information",
          autoFixable: true,
        })
      } else if (this.isGenericAltText(image.alt)) {
        results.push({
          ruleId: "1.1.1",
          passed: false,
          severity: "medium",
          element,
          message: "Alt text appears to be generic or non-descriptive",
          suggestion: "Use more specific, descriptive alt text that explains the image content",
          autoFixable: true,
        })
      }
    })

    return results
  }

  private validateHeadings(content: string): ValidationResult[] {
    const results: ValidationResult[] = []
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
    const headings: Array<{ level: number; text: string; index: number }> = []

    let match
    let index = 0
    while ((match = headingRegex.exec(content)) !== null) {
      const level = Number.parseInt(match[1])
      const text = match[2].replace(/<[^>]*>/g, "").trim()
      headings.push({ level, text, index: index++ })
    }

    // Check for H1 presence
    const h1Count = headings.filter((h) => h.level === 1).length
    if (h1Count === 0) {
      results.push({
        ruleId: "2.4.6",
        passed: false,
        severity: "high",
        message: "Page is missing an H1 heading",
        suggestion: "Add a main H1 heading that describes the page content",
        autoFixable: false,
      })
    } else if (h1Count > 1) {
      results.push({
        ruleId: "2.4.6",
        passed: false,
        severity: "medium",
        message: "Page has multiple H1 headings",
        suggestion: "Use only one H1 heading per page",
        autoFixable: false,
      })
    }

    // Check heading hierarchy
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i]
      const previous = headings[i - 1]

      if (current.level > previous.level + 1) {
        results.push({
          ruleId: "1.3.1",
          passed: false,
          severity: "medium",
          element: `Heading ${i + 1}`,
          message: `Heading level skips from H${previous.level} to H${current.level}`,
          suggestion: `Use H${previous.level + 1} instead of H${current.level} to maintain proper hierarchy`,
          autoFixable: true,
        })
      }
    }

    // Check for empty headings
    headings.forEach((heading, index) => {
      if (!heading.text || heading.text.length === 0) {
        results.push({
          ruleId: "2.4.6",
          passed: false,
          severity: "high",
          element: `Heading ${index + 1}`,
          message: "Heading is empty",
          suggestion: "Add descriptive text that explains the section content",
          autoFixable: false,
        })
      } else if (heading.text.length < 3) {
        results.push({
          ruleId: "2.4.6",
          passed: false,
          severity: "low",
          element: `Heading ${index + 1}`,
          message: "Heading text is very short",
          suggestion: "Consider using more descriptive heading text",
          autoFixable: false,
        })
      }
    })

    return results
  }

  private validateColorContrast(content: string): ValidationResult[] {
    const results: ValidationResult[] = []

    // Extract color combinations from inline styles
    const styleRegex = /style="([^"]*)"/gi
    let match

    while ((match = styleRegex.exec(content)) !== null) {
      const style = match[1]
      const colorMatch = style.match(/color:\s*([^;]+)/i)
      const bgColorMatch = style.match(/background-color:\s*([^;]+)/i)

      if (colorMatch && bgColorMatch) {
        try {
          const textColor = Color(colorMatch[1].trim())
          const bgColor = Color(bgColorMatch[1].trim())
          const contrast = textColor.contrast(bgColor)

          if (contrast < 4.5) {
            results.push({
              ruleId: "1.4.3",
              passed: false,
              severity: contrast < 3 ? "high" : "medium",
              message: `Color contrast ratio is ${contrast.toFixed(2)}:1 (minimum required: 4.5:1)`,
              suggestion: "Increase contrast between text and background colors",
              autoFixable: false,
            })
          }
        } catch (error) {
          // Invalid color format
          results.push({
            ruleId: "1.4.3",
            passed: false,
            severity: "low",
            message: "Unable to parse color values for contrast checking",
            suggestion: "Use valid CSS color values",
            autoFixable: false,
          })
        }
      }
    }

    return results
  }

  private validateSemanticStructure(content: string): ValidationResult[] {
    const results: ValidationResult[] = []

    // Check for proper list structure
    const listRegex = /<(ul|ol)[^>]*>(.*?)<\/\1>/gis
    let match

    while ((match = listRegex.exec(content)) !== null) {
      const listContent = match[2]
      const listItems = listContent.match(/<li[^>]*>.*?<\/li>/gi)

      if (!listItems || listItems.length === 0) {
        results.push({
          ruleId: "1.3.1",
          passed: false,
          severity: "medium",
          message: "List element contains no list items",
          suggestion: "Add <li> elements inside list containers or remove empty list",
          autoFixable: false,
        })
      }
    }

    // Check for tables without proper headers
    const tableRegex = /<table[^>]*>(.*?)<\/table>/gis
    while ((match = tableRegex.exec(content)) !== null) {
      const tableContent = match[1]
      const hasHeaders = /<th[^>]*>/i.test(tableContent) || /scope\s*=\s*["'](?:col|row)["']/i.test(tableContent)

      if (!hasHeaders) {
        results.push({
          ruleId: "1.3.1",
          passed: false,
          severity: "medium",
          message: "Table is missing proper headers",
          suggestion: "Add <th> elements or scope attributes to identify table headers",
          autoFixable: false,
        })
      }
    }

    return results
  }

  private validateARIA(content: string): ValidationResult[] {
    const results: ValidationResult[] = []

    // Check for ARIA labels on interactive elements
    const interactiveRegex = /<(button|input|select|textarea)[^>]*>/gi
    let match

    while ((match = interactiveRegex.exec(content)) !== null) {
      const element = match[0]
      const tagName = match[1].toLowerCase()

      const hasLabel =
        /aria-label\s*=/i.test(element) ||
        /aria-labelledby\s*=/i.test(element) ||
        (tagName === "input" && /type\s*=\s*["']submit["']/i.test(element)) ||
        (tagName === "input" && /value\s*=/i.test(element))

      if (!hasLabel && tagName === "button") {
        const buttonContent = content.match(
          new RegExp(`${match[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(.*?)</button>`, "i"),
        )
        if (!buttonContent || !buttonContent[1].trim()) {
          results.push({
            ruleId: "4.1.2",
            passed: false,
            severity: "high",
            element: "Button element",
            message: "Button is missing accessible name",
            suggestion: "Add aria-label attribute or text content to button",
            autoFixable: false,
          })
        }
      }

      if (!hasLabel && tagName === "input") {
        results.push({
          ruleId: "4.1.2",
          passed: false,
          severity: "high",
          element: "Input element",
          message: "Input is missing accessible name",
          suggestion: "Add aria-label, aria-labelledby, or associated label element",
          autoFixable: false,
        })
      }
    }

    // Check for invalid ARIA attributes
    const ariaRegex = /aria-([a-z]+)\s*=/gi
    while ((match = ariaRegex.exec(content)) !== null) {
      const ariaAttribute = match[1]
      if (!this.isValidARIAAttribute(ariaAttribute)) {
        results.push({
          ruleId: "4.1.2",
          passed: false,
          severity: "low",
          message: `Invalid ARIA attribute: aria-${ariaAttribute}`,
          suggestion: "Use valid ARIA attributes according to the specification",
          autoFixable: false,
        })
      }
    }

    return results
  }

  private isGenericAltText(altText: string): boolean {
    const genericTerms = [
      "image",
      "picture",
      "photo",
      "graphic",
      "icon",
      "logo",
      "banner",
      "untitled",
      "img",
      "pic",
      "screenshot",
    ]

    const lowerAlt = altText.toLowerCase().trim()
    return genericTerms.some(
      (term) => lowerAlt === term || lowerAlt.startsWith(`${term} `) || lowerAlt.endsWith(` ${term}`),
    )
  }

  private isValidARIAAttribute(attribute: string): boolean {
    const validAttributes = [
      "label",
      "labelledby",
      "describedby",
      "expanded",
      "hidden",
      "live",
      "atomic",
      "busy",
      "controls",
      "current",
      "details",
      "disabled",
      "dropeffect",
      "errormessage",
      "flowto",
      "grabbed",
      "haspopup",
      "invalid",
      "keyshortcuts",
      "level",
      "modal",
      "multiline",
      "multiselectable",
      "orientation",
      "owns",
      "placeholder",
      "posinset",
      "pressed",
      "readonly",
      "relevant",
      "required",
      "roledescription",
      "rowcount",
      "rowindex",
      "rowspan",
      "selected",
      "setsize",
      "sort",
      "valuemax",
      "valuemin",
      "valuenow",
      "valuetext",
    ]

    return validAttributes.includes(attribute)
  }

  calculateScore(results: ValidationResult[]): number {
    const weights = { high: 15, medium: 10, low: 5 }
    const totalDeduction = results
      .filter((result) => !result.passed)
      .reduce((sum, result) => sum + weights[result.severity], 0)

    return Math.max(0, 100 - totalDeduction)
  }
}
