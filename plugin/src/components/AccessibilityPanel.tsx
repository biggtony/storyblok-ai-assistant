"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Alert, AlertDescription } from "./ui/alert"
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Eye, ImageIcon } from "lucide-react"
import type { PluginData } from "./AIContentPlugin"

interface AccessibilityPanelProps {
  data: PluginData
  onUpdateData: (updates: Partial<PluginData>) => void
  onScoreUpdate: (score: number) => void
}

interface AccessibilityIssue {
  id: string
  type: "alt-text" | "contrast" | "heading" | "aria" | "semantic"
  severity: "high" | "medium" | "low"
  element: string
  description: string
  recommendation: string
  autoFixable: boolean
}

export function AccessibilityPanel({ data, onUpdateData, onScoreUpdate }: AccessibilityPanelProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [issues, setIssues] = useState<AccessibilityIssue[]>([])
  const [score, setScore] = useState(data.accessibilityScore || 0)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const runAccessibilityCheck = async () => {
    if (!data.userPreferences.accessibilityEnabled) {
      setError("Accessibility checking is disabled. Enable it in Settings.")
      return
    }

    setIsChecking(true)
    setError(null)

    try {
      // Get content from Storyblok editor (simulated for now)
      const content = getEditorContent()
      const images = getEditorImages()

      const response = await fetch("/api/accessibility/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          images,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setIssues(result.issues || [])
        setScore(result.score || 0)
        setSuggestions(result.suggestions || [])
        onScoreUpdate(result.score || 0)

        onUpdateData({
          accessibilityScore: result.score || 0,
        })
      } else {
        setError(result.error || "Failed to check accessibility")
      }
    } catch (error) {
      console.error("Accessibility check error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsChecking(false)
    }
  }

  const generateAltText = async (imageId: string) => {
    try {
      // Get image data (simulated)
      const imageData = getImageData(imageId)

      const response = await fetch("/api/ai/generate-alt-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: imageData.data,
          mimeType: imageData.mimeType,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Update the image with generated alt text
        updateImageAltText(imageId, result.altText)

        // Remove the alt-text issue for this image
        setIssues((prev) => prev.filter((issue) => !(issue.type === "alt-text" && issue.element.includes(imageId))))
      }
    } catch (error) {
      console.error("Alt text generation error:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "low":
        return <Eye className="h-4 w-4 text-blue-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  // Simulated functions - in real implementation, these would interact with Storyblok
  const getEditorContent = () => {
    return "<h1>Sample Content</h1><p>This is sample content for accessibility checking.</p>"
  }

  const getEditorImages = () => {
    return [
      { src: "/sample-image.jpg", alt: "" },
      { src: "/another-image.png", alt: "Existing alt text" },
    ]
  }

  const getImageData = (imageId: string) => {
    return {
      data: "base64-encoded-image-data",
      mimeType: "image/jpeg",
    }
  }

  const updateImageAltText = (imageId: string, altText: string) => {
    console.log(`Updating image ${imageId} with alt text: ${altText}`)
    // In real implementation, this would update the Storyblok content
  }

  useEffect(() => {
    // Auto-run accessibility check if enabled and in real-time mode
    if (data.userPreferences.accessibilityEnabled && data.userPreferences.suggestionFrequency === "realtime") {
      runAccessibilityCheck()
    }
  }, [data.userPreferences])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Accessibility Check
            </CardTitle>
            <Button
              onClick={runAccessibilityCheck}
              disabled={isChecking || !data.userPreferences.accessibilityEnabled}
              variant="outline"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Run Check
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                <span className={getScoreColor(score)}>{score}/100</span>
              </div>
              <div className="text-sm text-muted-foreground">WCAG 2.1 AA Compliance Score</div>
            </div>
            <div className="w-32">
              <Progress value={score} className="h-2" />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {issues.length === 0 && score > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Great! No accessibility issues found. Your content meets WCAG 2.1 AA standards.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issues Found ({issues.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {issues.map((issue) => (
              <div key={issue.id} className={`p-4 border rounded-lg ${getSeverityColor(issue.severity)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(issue.severity)}
                    <Badge variant="outline" className="text-xs">
                      {issue.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {issue.severity}
                    </Badge>
                  </div>
                  {issue.autoFixable && issue.type === "alt-text" && (
                    <Button size="sm" onClick={() => generateAltText(issue.element)} className="text-xs">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Auto-fix
                    </Button>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-sm">{issue.element}</div>
                  <div className="text-sm">{issue.description}</div>
                  <div className="text-xs text-muted-foreground">💡 {issue.recommendation}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
