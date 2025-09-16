"use client"

import { useState, useEffect } from "react"
import { useFieldPlugin } from "@storyblok/field-plugin"
import { ContentGenerator } from "./ContentGenerator"
import { AccessibilityPanel } from "./AccessibilityPanel"
import { UserSettings } from "./UserSettings"
import { AdvancedSettings } from "./AdvancedSettings"
import { CollaborationIndicator } from "./CollaborationIndicator"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import { Sparkles, Shield, Settings, RefreshCw, Users, Sliders } from "lucide-react"
import { CollaborationManager } from "../../../lib/collaboration-manager"

export interface PluginData {
  aiSuggestions: Array<{
    id: string
    content: string
    type: string
    accepted: boolean
  }>
  accessibilityScore: number
  userPreferences: {
    aiEnabled: boolean
    accessibilityEnabled: boolean
    suggestionFrequency: "realtime" | "on-demand" | "off"
    tone: string
    style: string
  }
}

export function AIContentPlugin() {
  const { data, actions, isLoading } = useFieldPlugin<PluginData>({
    validateContent: (content) => {
      return { valid: true }
    },
  })

  const [activeTab, setActiveTab] = useState("generator")
  const [isGenerating, setIsGenerating] = useState(false)
  const [accessibilityScore, setAccessibilityScore] = useState(data?.accessibilityScore || 0)
  const [collaborationManager] = useState(() => new CollaborationManager())
  const [currentUserId] = useState("current-user") // In real app, get from auth

  const defaultData: PluginData = {
    aiSuggestions: [],
    accessibilityScore: 0,
    userPreferences: {
      aiEnabled: true,
      accessibilityEnabled: true,
      suggestionFrequency: "on-demand",
      tone: "professional",
      style: "clear",
    },
  }

  const currentData = data || defaultData

  useEffect(() => {
    // Initialize collaboration
    collaborationManager.addCollaborator(currentUserId, "Current User")

    // Set up real-time sync (in real implementation, this would use WebSockets)
    collaborationManager.on("collaborator-updated", (data) => {
      console.log("Collaborator updated:", data)
    })

    collaborationManager.on("conflict-detected", (conflict) => {
      console.log("Conflict detected:", conflict)
    })

    return () => {
      collaborationManager.removeCollaborator(currentUserId)
    }
  }, [collaborationManager, currentUserId])

  const updateData = (updates: Partial<PluginData>) => {
    const newData = { ...currentData, ...updates }
    actions.setContent(newData)

    // Broadcast update to other collaborators
    collaborationManager.broadcastUpdate("data-updated", updates, currentUserId)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    collaborationManager.updateCollaboratorState(currentUserId, { activeTab: tab })
  }

  const handleResolveConflict = (conflictId: string, resolution: "merge" | "override" | "defer") => {
    collaborationManager.resolveConflict(conflictId, resolution, currentUserId)
  }

  const handleRefreshAll = async () => {
    setIsGenerating(true)

    // Check for conflicts before proceeding
    const conflict = collaborationManager.detectConflict("suggestion", {}, currentUserId)
    if (conflict) {
      console.log("Conflict detected, deferring refresh")
      setIsGenerating(false)
      return
    }

    try {
      await Promise.all([generateContentSuggestions(), runAccessibilityCheck()])
    } catch (error) {
      console.error("Error refreshing content:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateContentSuggestions = async () => {
    collaborationManager.updateCollaboratorState(currentUserId, { isEditing: true })
    // Implementation handled in ContentGenerator component
    setTimeout(() => {
      collaborationManager.updateCollaboratorState(currentUserId, { isEditing: false })
    }, 2000)
  }

  const runAccessibilityCheck = async () => {
    // Implementation handled in AccessibilityPanel component
    console.log("Running accessibility check...")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading AI Assistant...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Collaboration Indicator */}
      <CollaborationIndicator currentUserId={currentUserId} onResolveConflict={handleResolveConflict} />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Content & Accessibility Assistant
            </CardTitle>
            <Button onClick={handleRefreshAll} disabled={isGenerating} variant="outline" size="sm">
              {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh All
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${currentData.userPreferences.aiEnabled ? "bg-green-500" : "bg-gray-400"}`}
              />
              AI {currentData.userPreferences.aiEnabled ? "Enabled" : "Disabled"}
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Accessibility Score: {accessibilityScore}/100
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Generator
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Accessibility
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Advanced
              </TabsTrigger>
              <TabsTrigger value="collaboration" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="mt-4">
              <ContentGenerator
                data={currentData}
                onUpdateData={updateData}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
              />
            </TabsContent>

            <TabsContent value="accessibility" className="mt-4">
              <AccessibilityPanel data={currentData} onUpdateData={updateData} onScoreUpdate={setAccessibilityScore} />
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <UserSettings data={currentData} onUpdateData={updateData} />
            </TabsContent>

            <TabsContent value="advanced" className="mt-4">
              <AdvancedSettings data={currentData} onUpdateData={updateData} />
            </TabsContent>

            <TabsContent value="collaboration" className="mt-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Collaboration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Real-time collaboration features are active. You can see other team members' activity and resolve
                      conflicts as they arise.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
