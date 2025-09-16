"use client"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Separator } from "./ui/separator"
import { Settings, Sparkles, Shield, Bell } from "lucide-react"
import type { PluginData } from "./AIContentPlugin"

interface UserSettingsProps {
  data: PluginData
  onUpdateData: (updates: Partial<PluginData>) => void
}

export function UserSettings({ data, onUpdateData }: UserSettingsProps) {
  const updatePreference = (key: keyof PluginData["userPreferences"], value: any) => {
    onUpdateData({
      userPreferences: {
        ...data.userPreferences,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Content Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ai-enabled">Enable AI Suggestions</Label>
              <div className="text-sm text-muted-foreground">Get AI-powered content suggestions while editing</div>
            </div>
            <Switch
              id="ai-enabled"
              checked={data.userPreferences.aiEnabled}
              onCheckedChange={(checked) => updatePreference("aiEnabled", checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Content Tone</Label>
              <Select value={data.userPreferences.tone} onValueChange={(value) => updatePreference("tone", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Writing Style</Label>
              <Select value={data.userPreferences.style} onValueChange={(value) => updatePreference("style", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Clear & Concise</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="informative">Informative</SelectItem>
                  <SelectItem value="engaging">Engaging</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Accessibility Checking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="accessibility-enabled">Enable Accessibility Checks</Label>
              <div className="text-sm text-muted-foreground">
                Automatically check content for WCAG 2.1 AA compliance
              </div>
            </div>
            <Switch
              id="accessibility-enabled"
              checked={data.userPreferences.accessibilityEnabled}
              onCheckedChange={(checked) => updatePreference("accessibilityEnabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Suggestion Frequency</Label>
            <Select
              value={data.userPreferences.suggestionFrequency}
              onValueChange={(value) => updatePreference("suggestionFrequency", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="on-demand">On-demand only</SelectItem>
                <SelectItem value="off">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              {data.userPreferences.suggestionFrequency === "realtime" &&
                "Get suggestions as you type and edit content"}
              {data.userPreferences.suggestionFrequency === "on-demand" &&
                "Only show suggestions when you click the generate button"}
              {data.userPreferences.suggestionFrequency === "off" && "No automatic suggestions will be shown"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Current Configuration:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>AI Generation: {data.userPreferences.aiEnabled ? "Enabled" : "Disabled"}</li>
              <li>Accessibility Checks: {data.userPreferences.accessibilityEnabled ? "Enabled" : "Disabled"}</li>
              <li>Suggestion Mode: {data.userPreferences.suggestionFrequency}</li>
              <li>Content Tone: {data.userPreferences.tone}</li>
              <li>Writing Style: {data.userPreferences.style}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
