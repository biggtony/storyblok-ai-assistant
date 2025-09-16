"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Alert, AlertDescription } from "./ui/alert"
import { Button } from "./ui/button"
import { Users, AlertTriangle, Check, X } from "lucide-react"

interface Collaborator {
  userId: string
  userName: string
  activeTab: string
  isEditing: boolean
  timestamp: number
}

interface Conflict {
  conflictId: string
  type: "suggestion" | "accessibility" | "settings"
  users: string[]
  description: string
}

interface CollaborationIndicatorProps {
  currentUserId: string
  onResolveConflict: (conflictId: string, resolution: "merge" | "override" | "defer") => void
}

export function CollaborationIndicator({ currentUserId, onResolveConflict }: CollaborationIndicatorProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [showConflicts, setShowConflicts] = useState(false)

  useEffect(() => {
    // Simulate real-time collaboration data
    const mockCollaborators: Collaborator[] = [
      {
        userId: "user-1",
        userName: "Alice Johnson",
        activeTab: "generator",
        isEditing: true,
        timestamp: Date.now() - 30000,
      },
      {
        userId: "user-2",
        userName: "Bob Smith",
        activeTab: "accessibility",
        isEditing: false,
        timestamp: Date.now() - 60000,
      },
    ]

    const mockConflicts: Conflict[] = [
      {
        conflictId: "conflict-1",
        type: "suggestion",
        users: ["user-1", currentUserId],
        description: "Multiple users are generating content suggestions simultaneously",
      },
    ]

    setCollaborators(mockCollaborators)
    setConflicts(mockConflicts)
  }, [currentUserId])

  const getTabColor = (tab: string) => {
    switch (tab) {
      case "generator":
        return "bg-blue-100 text-blue-800"
      case "accessibility":
        return "bg-green-100 text-green-800"
      case "settings":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className="space-y-3">
      {/* Active Collaborators */}
      {collaborators.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Active Collaborators:</span>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              {collaborators.map((collaborator) => (
                <Tooltip key={collaborator.userId}>
                  <TooltipTrigger>
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/avatars/${collaborator.userId}.jpg`} />
                        <AvatarFallback className="text-xs">{getInitials(collaborator.userName)}</AvatarFallback>
                      </Avatar>
                      {collaborator.isEditing && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <div className="font-medium">{collaborator.userName}</div>
                      <Badge className={`text-xs ${getTabColor(collaborator.activeTab)}`}>
                        {collaborator.activeTab}
                      </Badge>
                      <div className="text-xs text-muted-foreground">{formatTimeAgo(collaborator.timestamp)}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="space-y-2">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{conflicts.length} collaboration conflict(s) detected</span>
              <Button variant="outline" size="sm" onClick={() => setShowConflicts(!showConflicts)} className="ml-2">
                {showConflicts ? "Hide" : "Show"} Details
              </Button>
            </AlertDescription>
          </Alert>

          {showConflicts && (
            <div className="space-y-2">
              {conflicts.map((conflict) => (
                <div key={conflict.conflictId} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-red-900 capitalize">{conflict.type} Conflict</div>
                      <div className="text-sm text-red-700">{conflict.description}</div>
                      <div className="text-xs text-red-600 mt-1">Users involved: {conflict.users.join(", ")}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => onResolveConflict(conflict.conflictId, "merge")}
                      className="text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Merge
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResolveConflict(conflict.conflictId, "override")}
                      className="text-xs"
                    >
                      Override
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onResolveConflict(conflict.conflictId, "defer")}
                      className="text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Defer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Collaborators */}
      {collaborators.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-2">No other users currently active</div>
      )}
    </div>
  )
}
