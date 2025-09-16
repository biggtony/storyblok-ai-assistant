"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  Users,
  Sparkles,
  Shield,
  Download,
  RefreshCw,
  Activity,
  Target,
  Clock,
  CheckCircle,
} from "lucide-react"
import type { AnalyticsMetrics } from "@/lib/analytics-collector"

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week")
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [timeRange])

  const loadMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/metrics?timeRange=${timeRange}`)
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error("Failed to load metrics:", error)
      // Load mock data for demo
      setMetrics(getMockMetrics())
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async (format: "json" | "csv") => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}`)
      const data = await response.text()

      const blob = new Blob([data], {
        type: format === "json" ? "application/json" : "text/csv",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${Date.now()}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  const aiChartData = [
    { name: "Generated", value: metrics.aiAdoption.totalSuggestions },
    { name: "Accepted", value: metrics.aiAdoption.acceptedSuggestions },
    { name: "Rejected", value: metrics.aiAdoption.rejectedSuggestions },
  ]

  const accessibilityTrendData = [
    { name: "Week 1", score: 65 },
    { name: "Week 2", score: 72 },
    { name: "Week 3", score: 78 },
    { name: "Week 4", score: metrics.accessibility.averageScore },
  ]

  const featureUsageData = metrics.usage.mostUsedFeatures.map((feature) => ({
    name: feature.feature.replace("_", " "),
    usage: feature.usage,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">AI Assistant performance and usage insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => exportData("json")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => exportData("csv")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Adoption Rate</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.aiAdoption.acceptanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.aiAdoption.acceptedSuggestions} of {metrics.aiAdoption.totalSuggestions} suggestions accepted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessibility Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.accessibility.averageScore.toFixed(0)}/100</div>
            <p className="text-xs text-muted-foreground">
              {metrics.accessibility.scoreImprovement > 0 ? "+" : ""}
              {metrics.accessibility.scoreImprovement.toFixed(1)} improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.usage.activeUsers}</div>
            <p className="text-xs text-muted-foreground">{metrics.usage.sessionsToday} sessions today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.collaboration.teamProductivity}</div>
            <p className="text-xs text-muted-foreground">Actions completed this {timeRange}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ai-adoption" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai-adoption">AI Adoption</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-adoption" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Suggestion Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={aiChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suggestion Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Average Confidence</span>
                    <span>{metrics.aiAdoption.averageConfidence.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.aiAdoption.averageConfidence} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Confidence (80%+)</span>
                    <Badge variant="secondary">45%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Confidence (60-80%)</span>
                    <Badge variant="secondary">35%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Confidence (&lt;60%)</span>
                    <Badge variant="secondary">20%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={accessibilityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issue Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Issues Fixed</span>
                  </div>
                  <span className="font-bold">{metrics.accessibility.issuesFixed}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Checks Run</span>
                  </div>
                  <span className="font-bold">{metrics.accessibility.checksRun}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Issues Found</span>
                  </div>
                  <span className="font-bold">{metrics.accessibility.issuesFound}</span>
                </div>

                <div className="pt-2">
                  <div className="text-sm text-muted-foreground mb-2">Fix Rate</div>
                  <Progress
                    value={
                      metrics.accessibility.issuesFound > 0
                        ? (metrics.accessibility.issuesFixed / metrics.accessibility.issuesFound) * 100
                        : 0
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={featureUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage"
                    >
                      {featureUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Avg Session Duration</span>
                  </div>
                  <span className="font-bold">{Math.round(metrics.usage.averageSessionDuration / 60000)}m</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Most Active Features</h4>
                  {metrics.usage.mostUsedFeatures.slice(0, 3).map((feature, index) => (
                    <div key={feature.feature} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{feature.feature.replace("_", " ")}</span>
                      <Badge variant="outline">{feature.usage} uses</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Conflicts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{metrics.collaboration.conflictsDetected}</div>
                <div className="text-sm text-muted-foreground">{metrics.collaboration.conflictsResolved} resolved</div>
                <Progress
                  value={
                    metrics.collaboration.conflictsDetected > 0
                      ? (metrics.collaboration.conflictsResolved / metrics.collaboration.conflictsDetected) * 100
                      : 0
                  }
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {Math.round(metrics.collaboration.averageResolutionTime / 60000)}m
                </div>
                <div className="text-sm text-muted-foreground">Average time to resolve</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Productivity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{metrics.collaboration.teamProductivity}</div>
                <div className="text-sm text-muted-foreground">Completed actions</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getMockMetrics() {
  return {
    aiAdoption: {
      totalSuggestions: 156,
      acceptedSuggestions: 89,
      rejectedSuggestions: 67,
      acceptanceRate: 57.1,
      averageConfidence: 78.5,
    },
    accessibility: {
      checksRun: 45,
      issuesFound: 123,
      issuesFixed: 98,
      averageScore: 82.3,
      scoreImprovement: 12.7,
    },
    usage: {
      activeUsers: 12,
      sessionsToday: 28,
      averageSessionDuration: 18 * 60 * 1000, // 18 minutes
      mostUsedFeatures: [
        { feature: "ai_suggestion_generated", usage: 156 },
        { feature: "accessibility_check_run", usage: 45 },
        { feature: "alt_text_generated", usage: 34 },
        { feature: "settings_changed", usage: 23 },
        { feature: "plugin_activated", usage: 12 },
      ],
    },
    collaboration: {
      conflictsDetected: 8,
      conflictsResolved: 6,
      averageResolutionTime: 5 * 60 * 1000, // 5 minutes
      teamProductivity: 187,
    },
  }
}
