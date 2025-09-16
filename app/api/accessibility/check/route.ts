import { type NextRequest, NextResponse } from "next/server"
import { GeminiClient } from "@/lib/gemini-client"
import { AccessibilityChecker } from "@/lib/accessibility-checker"
import { CacheManager } from "@/lib/cache-manager"

const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!)
const accessibilityChecker = new AccessibilityChecker(geminiClient)
const cache = new CacheManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, images } = body

    if (!content) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 })
    }

    // Generate cache key
    const cacheKey = cache.generateKey("accessibility", {
      content: content.substring(0, 200), // Use first 200 chars for cache key
      imageCount: images?.length || 0,
    })

    // Check cache first
    const cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      })
    }

    // Perform accessibility check
    const result = await accessibilityChecker.checkContent(content, images)

    // Cache results
    cache.set(cacheKey, { success: true, ...result }, 15 * 60 * 1000) // 15 minutes

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Accessibility check API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check accessibility",
      },
      { status: 500 },
    )
  }
}
