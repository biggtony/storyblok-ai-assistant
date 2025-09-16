"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { Slider } from "./ui/slider"
import { Settings, Plus, Trash2, Users, Bell, Zap } from "lucide-react"
import type { PluginData } from "./AIContentPlugin"

interface AdvancedSettingsProps {
  data: PluginData
  onUpdateData: (updates: Partial<PluginData>) => void
}

interface CustomPrompt {
  id: string
  name: string
  prompt: string
  contentType: string
}

export function AdvancedSettings({ data, onUpdateData }: AdvancedSettingsProps) {
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([])
  const [newPrompt, setNewPrompt] = useState({ name: "", prompt: "", contentType: "paragraph" })
  const [autoAcceptThreshold, setAutoAcceptThreshold] = useState([80])

  const updatePreference = (key: keyof PluginData["userPreferences"], value: any) => {
    onUpdateData({
      userPreferences: {
        ...data.userPreferences,
        [key]: value,
      },
    })
  }

  const addCustomPrompt = () => {
    if (newPrompt.name && newPrompt.prompt) {
      const prompt: CustomPrompt = {
        id: `prompt-${Date.now()}`,
        ...newPrompt,
      }
      setCustomPrompts([...customPrompts, prompt])
      setNewPrompt({ name: "", prompt: "", contentType: "paragraph" })
    }
  }

  const removeCustomPrompt = (id: string) => {
    setCustomPrompts(customPrompts.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* AI Behavior Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Behavior
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auto-accept">Auto-Accept Threshold</Label>
            <div className="px-3">
              <Slider
                value={autoAcceptThreshold}
                onValueChange={setAutoAcceptThreshold}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Never</span>
                <span>{autoAcceptThreshold[0]}%</span>
                <span>Always</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Automatically accept AI suggestions with confidence above this threshold
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Content Length Preference</Label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                  <SelectItem value="medium">Medium (2-4 sentences)</SelectItem>
                  <SelectItem value="long">Long (4+ sentences)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Creativity Level</Label>
              <Select defaultValue="balanced">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Prompt name"
                value={newPrompt.name}
                onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
              />
              <Select
                value={newPrompt.contentType}
                onValueChange={(value) => setNewPrompt({ ...newPrompt, contentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heading">Heading</SelectItem>
                  <SelectItem value="paragraph">Paragraph</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addCustomPrompt} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <Textarea
              placeholder="Enter your custom prompt template..."
              value={newPrompt.prompt}
              onChange={(e) => setNewPrompt({ ...newPrompt, prompt: e.target.value })}
              rows={3}
            />
          </div>

          {customPrompts.length > 0 && (
            <div className="space-y-2">
              <Label>Saved Prompts</Label>
              {customPrompts.map((prompt) => (
                <div key={prompt.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{prompt.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {prompt.contentType}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">{prompt.prompt}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomPrompt(prompt.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collaboration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="share-activity">Share Activity Status</Label>
              <div className="text-sm text-muted-foreground">Let other users see when you're actively editing</div>
            </div>
            <Switch id="share-activity" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-overrides">Allow Suggestion Overrides</Label>
              <div className="text-sm text-muted-foreground">
                Let other users modify or override your AI suggestions
              </div>
            </div>
            <Switch id="allow-overrides" />
          </div>

          <div className="space-y-2">
            <Label>Conflict Resolution</Label>
            <Select defaultValue="manual">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automatic (merge when possible)</SelectItem>
                <SelectItem value="manual">Manual (always ask)</SelectItem>
                <SelectItem value="defer">Defer to team lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-conflicts">Collaboration Conflicts</Label>
              <div className="text-sm text-muted-foreground">Get notified when conflicts need resolution</div>
            </div>
            <Switch id="notify-conflicts" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-suggestions">New AI Suggestions</Label>
              <div className="text-sm text-muted-foreground">Get notified when AI generates new suggestions</div>
            </div>
            <Switch id="notify-suggestions" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-accessibility">Accessibility Issues</Label>
              <div className="text-sm text-muted-foreground">Get notified about accessibility problems</div>
            </div>
            <Switch id="notify-accessibility" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cache-suggestions">Cache AI Suggestions</Label>
              <div className="text-sm text-muted-foreground">Store suggestions locally for faster access</div>
            </div>
            <Switch id="cache-suggestions" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="preload-analysis">Preload Accessibility Analysis</Label>
              <div className="text-sm text-muted-foreground">Run accessibility checks in the background</div>
            </div>
            <Switch id="preload-analysis" />
          </div>

          <div className="space-y-2">
            <Label>API Request Timeout</Label>
            <Select defaultValue="30">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">60 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
