"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Sparkles, Check, X, Copy, RefreshCw } from "lucide-react"
import type { PluginData } from "./AIContentPlugin"

interface ContentGeneratorProps {
  data: PluginData
  onUpdateData: (updates: Partial<PluginData>) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

interface ContentSuggestion {
  id: string
  content: string
  type: "heading" | "paragraph" | "list" | "quote"
  confidence: "high" | "medium" | "low"
  accepted?: boolean
}

export function ContentGenerator({ data, onUpdateData, isGenerating, setIsGenerating }: ContentGeneratorProps) {
  const [contentType, setContentType] = useState<string>("paragraph")
  const [context, setContext] = useState("")
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([])
  const [error, setError] = useState<string | null>(null)

  const contentTypes = [
    { value: "heading", label: "Heading" },
    { value: "paragraph", label: "Paragraph" },
    { value: "list", label: "List" },
    { value: "quote", label: "Quote" },
  ]

  const generateContent = async () => {
    if (!data.userPreferences.aiEnabled) {
      setError("AI content generation is disabled. Enable it in Settings.")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType,
          existingContent: context,
          tone: data.userPreferences.tone,
          style: data.userPreferences.style,
          length: "medium",
        }),
      })

      const result = await response.json()

      if (result.success) {
        const newSuggestions: ContentSuggestion[] = result.suggestions.map((suggestion: any) => ({
          id: `suggestion-${Date.now()}-${Math.random()}`,
          content: suggestion.content,
          type: contentType as ContentSuggestion["type"],
          confidence: suggestion.confidence || "medium",
          accepted: false,
        }))

        setSuggestions(newSuggestions)

        // Update plugin data
        onUpdateData({
          aiSuggestions: [...data.aiSuggestions, ...newSuggestions],
        })
      } else {
        setError(result.error || "Failed to generate content")

        // Show fallback content if available
        if (result.fallback) {
          const fallbackSuggestion: ContentSuggestion = {
            id: `fallback-${Date.now()}`,
            content: result.fallback,
            type: contentType as ContentSuggestion["type"],
            confidence: "low",
            accepted: false,
          }
          setSuggestions([fallbackSuggestion])
        }
      }
    } catch (error) {
      console.error("Content generation error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const acceptSuggestion = (suggestionId: string) => {
    setSuggestions((prev) => prev.map((s) => (s.id === suggestionId ? { ...s, accepted: true } : s)))

    // Update plugin data
    const updatedSuggestions = data.aiSuggestions.map((s) => (s.id === suggestionId ? { ...s, accepted: true } : s))
    onUpdateData({ aiSuggestions: updatedSuggestions })

    // Copy to clipboard for easy pasting
    const suggestion = suggestions.find((s) => s.id === suggestionId)
    if (suggestion) {
      navigator.clipboard.writeText(suggestion.content)
    }
  }

  const rejectSuggestion = (suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))

    const updatedSuggestions = data.aiSuggestions.filter((s) => s.id !== suggestionId)
    onUpdateData({ aiSuggestions: updatedSuggestions })
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Content Type</label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tone & Style</label>
              <div className="text-sm text-muted-foreground">
                {data.userPreferences.tone} • {data.userPreferences.style}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Context (Optional)</label>
            <Textarea
              placeholder="Provide context about your content to get better suggestions..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={generateContent}
            disabled={isGenerating || !data.userPreferences.aiEnabled}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>}
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-4 border rounded-lg ${
                  suggestion.accepted ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type}
                    </Badge>
                    <Badge className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                      {suggestion.confidence} confidence
                    </Badge>
                  </div>
                  {!suggestion.accepted && (
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(suggestion.content)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => acceptSuggestion(suggestion.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => rejectSuggestion(suggestion.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-sm leading-relaxed">{suggestion.content}</div>
                {suggestion.accepted && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Accepted & copied to clipboard
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.aiSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {data.aiSuggestions.filter((s) => s.accepted).length} suggestions accepted out of{" "}
              {data.aiSuggestions.length} generated
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
