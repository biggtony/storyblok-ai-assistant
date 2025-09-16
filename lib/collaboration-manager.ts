export interface CollaborationState {
  userId: string
  userName: string
  timestamp: number
  activeTab: string
  isEditing: boolean
  currentSuggestion?: string
  accessibilityScore?: number
}

export interface ConflictResolution {
  conflictId: string
  type: "suggestion" | "accessibility" | "settings"
  users: string[]
  data: any
  resolution: "merge" | "override" | "defer"
  resolvedBy?: string
  resolvedAt?: number
}

export class CollaborationManager {
  private collaborators = new Map<string, CollaborationState>()
  private conflicts = new Map<string, ConflictResolution>()
  private eventListeners = new Map<string, Function[]>()

  // User presence management
  addCollaborator(userId: string, userName: string): void {
    this.collaborators.set(userId, {
      userId,
      userName,
      timestamp: Date.now(),
      activeTab: "generator",
      isEditing: false,
    })

    this.emit("collaborator-joined", { userId, userName })
  }

  removeCollaborator(userId: string): void {
    this.collaborators.delete(userId)
    this.emit("collaborator-left", { userId })
  }

  updateCollaboratorState(userId: string, updates: Partial<CollaborationState>): void {
    const current = this.collaborators.get(userId)
    if (current) {
      this.collaborators.set(userId, {
        ...current,
        ...updates,
        timestamp: Date.now(),
      })

      this.emit("collaborator-updated", { userId, updates })
    }
  }

  getActiveCollaborators(): CollaborationState[] {
    const now = Date.now()
    const activeThreshold = 5 * 60 * 1000 // 5 minutes

    return Array.from(this.collaborators.values()).filter((collab) => now - collab.timestamp < activeThreshold)
  }

  // Conflict detection and resolution
  detectConflict(type: ConflictResolution["type"], data: any, userId: string): ConflictResolution | null {
    const activeUsers = this.getActiveCollaborators().filter((c) => c.userId !== userId && c.isEditing)

    if (activeUsers.length === 0) {
      return null
    }

    // Check for specific conflict types
    switch (type) {
      case "suggestion":
        return this.detectSuggestionConflict(data, userId, activeUsers)
      case "accessibility":
        return this.detectAccessibilityConflict(data, userId, activeUsers)
      case "settings":
        return this.detectSettingsConflict(data, userId, activeUsers)
      default:
        return null
    }
  }

  resolveConflict(conflictId: string, resolution: ConflictResolution["resolution"], resolvedBy: string): boolean {
    const conflict = this.conflicts.get(conflictId)
    if (!conflict) {
      return false
    }

    conflict.resolution = resolution
    conflict.resolvedBy = resolvedBy
    conflict.resolvedAt = Date.now()

    this.emit("conflict-resolved", conflict)
    this.conflicts.delete(conflictId)

    return true
  }

  // Version control for AI suggestions
  createSuggestionVersion(suggestion: any, userId: string): string {
    const versionId = `v-${Date.now()}-${userId}`
    const version = {
      id: versionId,
      suggestion,
      createdBy: userId,
      createdAt: Date.now(),
      status: "active",
    }

    // Store version (in real implementation, this would be persisted)
    this.emit("version-created", version)

    return versionId
  }

  mergeSuggestions(suggestions: any[], strategy: "latest" | "merge" | "vote"): any {
    switch (strategy) {
      case "latest":
        return suggestions[suggestions.length - 1]

      case "merge":
        return this.mergeSuggestionContent(suggestions)

      case "vote":
        return this.selectByVote(suggestions)

      default:
        return suggestions[0]
    }
  }

  // Real-time synchronization
  broadcastUpdate(type: string, data: any, excludeUserId?: string): void {
    this.emit("broadcast", { type, data, excludeUserId })
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach((callback) => callback(data))
    }
  }

  private detectSuggestionConflict(
    data: any,
    userId: string,
    activeUsers: CollaborationState[],
  ): ConflictResolution | null {
    const conflictingUsers = activeUsers.filter((user) => user.currentSuggestion && user.activeTab === "generator")

    if (conflictingUsers.length > 0) {
      const conflictId = `suggestion-${Date.now()}`
      const conflict: ConflictResolution = {
        conflictId,
        type: "suggestion",
        users: [userId, ...conflictingUsers.map((u) => u.userId)],
        data,
        resolution: "defer",
      }

      this.conflicts.set(conflictId, conflict)
      return conflict
    }

    return null
  }

  private detectAccessibilityConflict(
    data: any,
    userId: string,
    activeUsers: CollaborationState[],
  ): ConflictResolution | null {
    const conflictingUsers = activeUsers.filter((user) => user.activeTab === "accessibility")

    if (conflictingUsers.length > 0) {
      const conflictId = `accessibility-${Date.now()}`
      const conflict: ConflictResolution = {
        conflictId,
        type: "accessibility",
        users: [userId, ...conflictingUsers.map((u) => u.userId)],
        data,
        resolution: "defer",
      }

      this.conflicts.set(conflictId, conflict)
      return conflict
    }

    return null
  }

  private detectSettingsConflict(
    data: any,
    userId: string,
    activeUsers: CollaborationState[],
  ): ConflictResolution | null {
    const conflictingUsers = activeUsers.filter((user) => user.activeTab === "settings")

    if (conflictingUsers.length > 0) {
      const conflictId = `settings-${Date.now()}`
      const conflict: ConflictResolution = {
        conflictId,
        type: "settings",
        users: [userId, ...conflictingUsers.map((u) => u.userId)],
        data,
        resolution: "defer",
      }

      this.conflicts.set(conflictId, conflict)
      return conflict
    }

    return null
  }

  private mergeSuggestionContent(suggestions: any[]): any {
    // Simple merge strategy - combine unique suggestions
    const merged = {
      content: suggestions.map((s) => s.content).join(" "),
      type: suggestions[0].type,
      confidence: "medium",
      sources: suggestions.map((s) => s.id),
    }

    return merged
  }

  private selectByVote(suggestions: any[]): any {
    // In a real implementation, this would consider user votes
    // For now, return the first suggestion
    return suggestions[0]
  }
}
