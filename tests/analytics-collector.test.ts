import { describe, it, expect, beforeEach, vi } from "vitest"
import { AnalyticsCollector } from "../lib/analytics-collector"

// Mock fetch
global.fetch = vi.fn()

describe("AnalyticsCollector", () => {
  let analyticsCollector: AnalyticsCollector

  beforeEach(() => {
    analyticsCollector = new AnalyticsCollector("test-user")
    vi.clearAllMocks()
  })

  describe("event tracking", () => {
    it("should track events", () => {
      analyticsCollector.track("ai_suggestion_generated", {
        contentType: "paragraph",
        confidence: 0.8,
      })

      const metrics = analyticsCollector.getMetrics("day")
      expect(metrics.aiAdoption.totalSuggestions).toBe(1)
    })

    it("should send events to analytics API", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(new Response("OK"))

      analyticsCollector.track("ai_suggestion_accepted", {
        suggestionId: "test-123",
      })

      expect(fetch).toHaveBeenCalledWith("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.stringContaining("ai_suggestion_accepted"),
      })
    })
  })

  describe("metrics calculation", () => {
    it("should calculate AI adoption metrics", () => {
      // Generate some test events
      analyticsCollector.track("ai_suggestion_generated", { confidence: 0.8 })
      analyticsCollector.track("ai_suggestion_generated", { confidence: 0.9 })
      analyticsCollector.track("ai_suggestion_accepted", {})
      analyticsCollector.track("ai_suggestion_rejected", {})

      const metrics = analyticsCollector.getMetrics("day")

      expect(metrics.aiAdoption.totalSuggestions).toBe(2)
      expect(metrics.aiAdoption.acceptedSuggestions).toBe(1)
      expect(metrics.aiAdoption.rejectedSuggestions).toBe(1)
      expect(metrics.aiAdoption.acceptanceRate).toBe(50)
      expect(metrics.aiAdoption.averageConfidence).toBe(85)
    })

    it("should calculate accessibility metrics", () => {
      analyticsCollector.track("accessibility_check_run", {
        score: 85,
        issuesCount: 3,
      })
      analyticsCollector.track("accessibility_check_run", {
        score: 90,
        issuesCount: 1,
      })
      analyticsCollector.track("accessibility_issue_fixed", {})
      analyticsCollector.track("accessibility_issue_fixed", {})

      const metrics = analyticsCollector.getMetrics("day")

      expect(metrics.accessibility.checksRun).toBe(2)
      expect(metrics.accessibility.issuesFound).toBe(4)
      expect(metrics.accessibility.issuesFixed).toBe(2)
      expect(metrics.accessibility.averageScore).toBe(87.5)
    })
  })

  describe("data export", () => {
    it("should export data as JSON", () => {
      analyticsCollector.track("plugin_activated", {})

      const exported = analyticsCollector.exportData("json")
      const data = JSON.parse(exported)

      expect(Array.isArray(data)).toBe(true)
      expect(data[0]).toMatchObject({
        eventType: "plugin_activated",
        userId: "test-user",
      })
    })

    it("should export data as CSV", () => {
      analyticsCollector.track("plugin_activated", {})

      const exported = analyticsCollector.exportData("csv")

      expect(exported).toContain("id,userId,eventType,timestamp,sessionId,data")
      expect(exported).toContain("plugin_activated")
      expect(exported).toContain("test-user")
    })
  })
})
