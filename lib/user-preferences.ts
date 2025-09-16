export interface UserPreferences {
  userId: string
  aiEnabled: boolean
  accessibilityEnabled: boolean
  suggestionFrequency: "realtime" | "on-demand" | "off"
  tone: string
  style: string
  autoAcceptThreshold: number
  notificationSettings: {
    conflicts: boolean
    suggestions: boolean
    accessibility: boolean
  }
  collaborationSettings: {
    shareActivity: boolean
    allowOverrides: boolean
    conflictResolution: "auto" | "manual"
  }
  customPrompts: Array<{
    id: string
    name: string
    prompt: string
    contentType: string
  }>
}

export class UserPreferencesManager {
  private preferences = new Map<string, UserPreferences>()
  private defaultPreferences: Omit<UserPreferences, "userId"> = {
    aiEnabled: true,
    accessibilityEnabled: true,
    suggestionFrequency: "on-demand",
    tone: "professional",
    style: "clear",
    autoAcceptThreshold: 0.8,
    notificationSettings: {
      conflicts: true,
      suggestions: true,
      accessibility: true,
    },
    collaborationSettings: {
      shareActivity: true,
      allowOverrides: false,
      conflictResolution: "manual",
    },
    customPrompts: [],
  }

  async loadUserPreferences(userId: string): Promise<UserPreferences> {
    // In real implementation, load from database
    let userPrefs = this.preferences.get(userId)

    if (!userPrefs) {
      userPrefs = {
        userId,
        ...this.defaultPreferences,
      }
      this.preferences.set(userId, userPrefs)
    }

    return userPrefs
  }

  async saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    const current = await this.loadUserPreferences(userId)
    const updated = { ...current, ...preferences }

    this.preferences.set(userId, updated)

    // In real implementation, save to database
    console.log(`Saved preferences for user ${userId}`)
  }

  async updatePreference<K extends keyof UserPreferences>(
    userId: string,
    key: K,
    value: UserPreferences[K],
  ): Promise<void> {
    const current = await this.loadUserPreferences(userId)
    current[key] = value

    await this.saveUserPreferences(userId, current)
  }

  async addCustomPrompt(
    userId: string,
    prompt: { name: string; prompt: string; contentType: string },
  ): Promise<string> {
    const preferences = await this.loadUserPreferences(userId)
    const promptId = `prompt-${Date.now()}`

    preferences.customPrompts.push({
      id: promptId,
      ...prompt,
    })

    await this.saveUserPreferences(userId, preferences)
    return promptId
  }

  async removeCustomPrompt(userId: string, promptId: string): Promise<void> {
    const preferences = await this.loadUserPreferences(userId)
    preferences.customPrompts = preferences.customPrompts.filter((p) => p.id !== promptId)

    await this.saveUserPreferences(userId, preferences)
  }

  async getTeamPreferences(userIds: string[]): Promise<UserPreferences[]> {
    const teamPrefs = await Promise.all(userIds.map((id) => this.loadUserPreferences(id)))
    return teamPrefs
  }

  mergeTeamPreferences(teamPrefs: UserPreferences[]): Partial<UserPreferences> {
    // Create merged preferences for team collaboration
    const merged: Partial<UserPreferences> = {}

    // Use most common settings
    merged.suggestionFrequency = this.getMostCommon(teamPrefs.map((p) => p.suggestionFrequency))
    merged.tone = this.getMostCommon(teamPrefs.map((p) => p.tone))
    merged.style = this.getMostCommon(teamPrefs.map((p) => p.style))

    // Use most permissive settings for collaboration
    merged.aiEnabled = teamPrefs.some((p) => p.aiEnabled)
    merged.accessibilityEnabled = teamPrefs.some((p) => p.accessibilityEnabled)

    return merged
  }

  private getMostCommon<T>(values: T[]): T {
    const counts = new Map<T, number>()

    values.forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1)
    })

    let mostCommon = values[0]
    let maxCount = 0

    counts.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count
        mostCommon = value
      }
    })

    return mostCommon
  }
}
