import { describe, it, expect, beforeEach } from "vitest"
import { CollaborationManager } from "../lib/collaboration-manager"

describe("CollaborationManager", () => {
  let collaborationManager: CollaborationManager

  beforeEach(() => {
    collaborationManager = new CollaborationManager()
  })

  describe("collaborator management", () => {
    it("should add collaborators", () => {
      collaborationManager.addCollaborator("user1", "Alice")

      const collaborators = collaborationManager.getActiveCollaborators()
      expect(collaborators).toHaveLength(1)
      expect(collaborators[0]).toMatchObject({
        userId: "user1",
        userName: "Alice",
        activeTab: "generator",
        isEditing: false,
      })
    })

    it("should remove collaborators", () => {
      collaborationManager.addCollaborator("user1", "Alice")
      collaborationManager.removeCollaborator("user1")

      const collaborators = collaborationManager.getActiveCollaborators()
      expect(collaborators).toHaveLength(0)
    })

    it("should update collaborator state", () => {
      collaborationManager.addCollaborator("user1", "Alice")
      collaborationManager.updateCollaboratorState("user1", {
        activeTab: "accessibility",
        isEditing: true,
      })

      const collaborators = collaborationManager.getActiveCollaborators()
      expect(collaborators[0]).toMatchObject({
        activeTab: "accessibility",
        isEditing: true,
      })
    })
  })

  describe("conflict detection", () => {
    it("should detect suggestion conflicts", () => {
      collaborationManager.addCollaborator("user1", "Alice")
      collaborationManager.addCollaborator("user2", "Bob")

      collaborationManager.updateCollaboratorState("user1", {
        activeTab: "generator",
        isEditing: true,
        currentSuggestion: "suggestion1",
      })

      const conflict = collaborationManager.detectConflict("suggestion", {}, "user2")

      expect(conflict).toMatchObject({
        type: "suggestion",
        users: ["user2", "user1"],
        resolution: "defer",
      })
    })

    it("should not detect conflicts when no other users are editing", () => {
      collaborationManager.addCollaborator("user1", "Alice")

      const conflict = collaborationManager.detectConflict("suggestion", {}, "user1")

      expect(conflict).toBeNull()
    })
  })

  describe("conflict resolution", () => {
    it("should resolve conflicts", () => {
      collaborationManager.addCollaborator("user1", "Alice")
      collaborationManager.addCollaborator("user2", "Bob")

      collaborationManager.updateCollaboratorState("user1", {
        activeTab: "generator",
        isEditing: true,
      })

      const conflict = collaborationManager.detectConflict("suggestion", {}, "user2")
      const resolved = collaborationManager.resolveConflict(conflict!.conflictId, "merge", "user1")

      expect(resolved).toBe(true)
    })
  })

  describe("version control", () => {
    it("should create suggestion versions", () => {
      const suggestion = { content: "Test suggestion", type: "paragraph" }
      const versionId = collaborationManager.createSuggestionVersion(suggestion, "user1")

      expect(versionId).toMatch(/^v-\d+-user1$/)
    })

    it("should merge suggestions using latest strategy", () => {
      const suggestions = [
        { content: "First", timestamp: 1 },
        { content: "Second", timestamp: 2 },
        { content: "Third", timestamp: 3 },
      ]

      const merged = collaborationManager.mergeSuggestions(suggestions, "latest")

      expect(merged).toEqual(suggestions[2])
    })
  })
})
