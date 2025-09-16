import { type NextRequest, NextResponse } from "next/server"
import { GeminiClient } from "@/lib/gemini-client"
import { CacheManager } from "@/lib/cache-manager"

const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!)
const cache = new CacheManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentType, existingContent, tone, style, length } = body

    // Generate cache key
    const cacheKey = cache.generateKey("content", {
      contentType,
      existingContent,
      tone,
      style,
      length,
    })

    // Check cache first
    const cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      })
    }

    // Generate new content
    const result = await geminiClient.generateContentBlock({
      contentType,
      existingContent,
      tone,
      style,
      length,
    })

    // Cache successful results
    if (result.success) {
      cache.set(cacheKey, result, 10 * 60 * 1000) // 10 minutes
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Content generation API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate content",
        fallback: "Content generation temporarily unavailable",
      },
      { status: 500 },
    )
  }
}
