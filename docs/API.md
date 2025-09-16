# API Documentation

## Gemini Client API

### `generateContentBlock(context: ContentContext): Promise<ContentResult>`

Generates AI-powered content suggestions based on context.

**Parameters:**
- `context.contentType`: Type of content to generate (heading, paragraph, list, quote)
- `context.existingContent`: Existing content for context
- `context.tone`: Desired tone (professional, casual, friendly, formal, creative)
- `context.style`: Writing style (clear, detailed, persuasive, informative, engaging)
- `context.length`: Content length (short, medium, long)

**Returns:**
\`\`\`typescript
{
  success: boolean
  content?: string
  suggestions?: Array<{
    id: string
    content: string
    type: string
    confidence: string
  }>
  error?: string
  fallback?: string
}
\`\`\`

### `generateAltText(imageData: string, mimeType: string): Promise<AltTextResult>`

Generates descriptive alt text for images using AI vision analysis.

**Parameters:**
- `imageData`: Base64-encoded image data
- `mimeType`: Image MIME type (image/jpeg, image/png, etc.)

**Returns:**
\`\`\`typescript
{
  success: boolean
  altText?: string
  confidence?: string
  error?: string
  fallback?: string
}
\`\`\`

## Accessibility Checker API

### `checkContent(content: string, images?: Image[]): Promise<AccessibilityReport>`

Performs comprehensive accessibility analysis on content.

**Parameters:**
- `content`: HTML content to analyze
- `images`: Array of image objects with src and alt properties

**Returns:**
\`\`\`typescript
{
  score: number
  issues: AccessibilityIssue[]
  suggestions: string[]
  imageAnalyses?: Array<{
    src: string
    analysis: ImageAnalysis
  }>
}
\`\`\`

### AccessibilityIssue Interface

\`\`\`typescript
interface AccessibilityIssue {
  id: string
  type: "alt-text" | "contrast" | "heading" | "aria" | "semantic"
  severity: "high" | "medium" | "low"
  element: string
  description: string
  recommendation: string
  autoFixable: boolean
}
\`\`\`

## Analytics API

### `POST /api/analytics/track`

Tracks user interaction events.

**Request Body:**
\`\`\`typescript
{
  userId: string
  eventType: string
  timestamp: number
  data: Record<string, any>
  sessionId: string
}
\`\`\`

### `GET /api/analytics/metrics?timeRange=week`

Retrieves analytics metrics for specified time range.

**Query Parameters:**
- `timeRange`: "day" | "week" | "month"

**Response:**
\`\`\`typescript
{
  aiAdoption: {
    totalSuggestions: number
    acceptedSuggestions: number
    rejectedSuggestions: number
    acceptanceRate: number
    averageConfidence: number
  }
  accessibility: {
    checksRun: number
    issuesFound: number
    issuesFixed: number
    averageScore: number
    scoreImprovement: number
  }
  usage: {
    activeUsers: number
    sessionsToday: number
    averageSessionDuration: number
    mostUsedFeatures: Array<{
      feature: string
      usage: number
    }>
  }
  collaboration: {
    conflictsDetected: number
    conflictsResolved: number
    averageResolutionTime: number
    teamProductivity: number
  }
}
\`\`\`

## CLI Commands

### `storyblok-ai audit`

Runs batch accessibility audit on content files.

**Options:**
- `-d, --directory <path>`: Content directory (default: ./content)
- `-o, --output <path>`: Output file (default: ./audit-results.json)
- `-f, --format <format>`: Output format (json|csv|html)
- `--fix`: Auto-fix issues where possible

### `storyblok-ai generate-alt-text`

Generates alt text for images in content files.

**Options:**
- `-d, --directory <path>`: Content directory (default: ./content)
- `-i, --images <path>`: Images directory (default: ./public/images)
- `--dry-run`: Preview changes without applying

### `storyblok-ai export-analytics`

Exports analytics data.

**Options:**
- `-f, --format <format>`: Export format (json|csv)
- `-o, --output <path>`: Output file path
- `-r, --range <range>`: Time range (day|week|month)
