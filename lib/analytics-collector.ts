export interface AnalyticsEvent {
  id: string
  userId: string
  eventType:
    | "ai_suggestion_generated"
    | "ai_suggestion_accepted"
    | "ai_suggestion_rejected"
    | "accessibility_check_run"
    | "accessibility_issue_fixed"
    | "alt_text_generated"
    | "collaboration_conflict"
    | "plugin_activated"
    | "settings_changed"
  timestamp: number
  data: Record<string, any>
  sessionId: string
}

export interface AnalyticsMetrics {
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
    mostUsedFeatures: Array<{ feature: string; usage: number }>
  }
  collaboration: {
    conflictsDetected: number
    conflictsResolved: number
    averageResolutionTime: number
    teamProductivity: number
  }
}

export class AnalyticsCollector {
  private events: AnalyticsEvent[] = []
  private sessionId: string
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  track(eventType: AnalyticsEvent["eventType"], data: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userId,
      eventType,
      timestamp: Date.now(),
      data: {
        ...data,
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
        url: typeof window !== "undefined" ? window.location.href : "unknown",
      },
      sessionId: this.sessionId,
    }

    this.events.push(event)
    this.sendToAnalytics(event)
  }

  getMetrics(timeRange: "day" | "week" | "month" = "week"): AnalyticsMetrics {
    const now = Date.now()
    const timeRangeMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    }

    const cutoff = now - timeRangeMs[timeRange]
    const recentEvents = this.events.filter((event) => event.timestamp >= cutoff)

    return {
      aiAdoption: this.calculateAIMetrics(recentEvents),
      accessibility: this.calculateAccessibilityMetrics(recentEvents),
      usage: this.calculateUsageMetrics(recentEvents),
      collaboration: this.calculateCollaborationMetrics(recentEvents),
    }
  }

  exportData(format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      return this.eventsToCSV(this.events)
    }
    return JSON.stringify(this.events, null, 2)
  }

  private async sendToAnalytics(event: AnalyticsEvent): Promise<void> {
    try {
      // In production, send to analytics service
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.warn("Failed to send analytics event:", error)
      // Store locally as fallback
      this.storeLocally(event)
    }
  }

  private storeLocally(event: AnalyticsEvent): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ai-assistant-analytics") || "[]"
      const events = JSON.parse(stored)
      events.push(event)

      // Keep only last 1000 events locally
      if (events.length > 1000) {
        events.splice(0, events.length - 1000)
      }

      localStorage.setItem("ai-assistant-analytics", JSON.stringify(events))
    }
  }

  private calculateAIMetrics(events: AnalyticsEvent[]): AnalyticsMetrics["aiAdoption"] {
    const suggestions = events.filter((e) => e.eventType === "ai_suggestion_generated")
    const accepted = events.filter((e) => e.eventType === "ai_suggestion_accepted")
    const rejected = events.filter((e) => e.eventType === "ai_suggestion_rejected")

    const totalSuggestions = suggestions.length
    const acceptedSuggestions = accepted.length
    const rejectedSuggestions = rejected.length
    const acceptanceRate = totalSuggestions > 0 ? (acceptedSuggestions / totalSuggestions) * 100 : 0

    const confidenceScores = suggestions.map((s) => s.data.confidence).filter((c) => typeof c === "number")
    const averageConfidence =
      confidenceScores.length > 0 ? confidenceScores.reduce((sum, c) => sum + c, 0) / confidenceScores.length : 0

    return {
      totalSuggestions,
      acceptedSuggestions,
      rejectedSuggestions,
      acceptanceRate,
      averageConfidence,
    }
  }

  private calculateAccessibilityMetrics(events: AnalyticsEvent[]): AnalyticsMetrics["accessibility"] {
    const checks = events.filter((e) => e.eventType === "accessibility_check_run")
    const fixes = events.filter((e) => e.eventType === "accessibility_issue_fixed")

    const checksRun = checks.length
    const issuesFixed = fixes.length

    const scores = checks.map((c) => c.data.score).filter((s) => typeof s === "number")
    const averageScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0

    const issuesFound = checks.reduce((sum, c) => sum + (c.data.issuesCount || 0), 0)

    // Calculate score improvement (simplified)
    const scoreImprovement = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0

    return {
      checksRun,
      issuesFound,
      issuesFixed,
      averageScore,
      scoreImprovement,
    }
  }

  private calculateUsageMetrics(events: AnalyticsEvent[]): AnalyticsMetrics["usage"] {
    const uniqueUsers = new Set(events.map((e) => e.userId)).size
    const uniqueSessions = new Set(events.map((e) => e.sessionId)).size

    // Calculate session durations
    const sessionDurations = new Map<string, { start: number; end: number }>()
    events.forEach((event) => {
      const session = sessionDurations.get(event.sessionId) || { start: event.timestamp, end: event.timestamp }
      session.start = Math.min(session.start, event.timestamp)
      session.end = Math.max(session.end, event.timestamp)
      sessionDurations.set(event.sessionId, session)
    })

    const durations = Array.from(sessionDurations.values()).map((s) => s.end - s.start)
    const averageSessionDuration =
      durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0

    // Most used features
    const featureUsage = new Map<string, number>()
    events.forEach((event) => {
      const feature = event.data.feature || event.eventType
      featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1)
    })

    const mostUsedFeatures = Array.from(featureUsage.entries())
      .map(([feature, usage]) => ({ feature, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5)

    return {
      activeUsers: uniqueUsers,
      sessionsToday: uniqueSessions,
      averageSessionDuration,
      mostUsedFeatures,
    }
  }

  private calculateCollaborationMetrics(events: AnalyticsEvent[]): AnalyticsMetrics["collaboration"] {
    const conflicts = events.filter((e) => e.eventType === "collaboration_conflict")
    const conflictsDetected = conflicts.length

    // Calculate resolution metrics (simplified)
    const conflictsResolved = conflicts.filter((c) => c.data.resolved).length
    const resolutionTimes = conflicts
      .filter((c) => c.data.resolved && c.data.resolutionTime)
      .map((c) => c.data.resolutionTime)

    const averageResolutionTime =
      resolutionTimes.length > 0 ? resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length : 0

    // Team productivity (simplified metric)
    const teamProductivity = events.filter(
      (e) => e.eventType === "ai_suggestion_accepted" || e.eventType === "accessibility_issue_fixed",
    ).length

    return {
      conflictsDetected,
      conflictsResolved,
      averageResolutionTime,
      teamProductivity,
    }
  }

  private eventsToCSV(events: AnalyticsEvent[]): string {
    if (events.length === 0) return ""

    const headers = ["id", "userId", "eventType", "timestamp", "sessionId", "data"]
    const rows = events.map((event) => [
      event.id,
      event.userId,
      event.eventType,
      new Date(event.timestamp).toISOString(),
      event.sessionId,
      JSON.stringify(event.data),
    ])

    return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
  }
}
