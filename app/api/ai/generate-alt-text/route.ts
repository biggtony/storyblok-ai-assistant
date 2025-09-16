import { type NextRequest, NextResponse } from "next/server"
import { GeminiClient } from "@/lib/gemini-client"
import { CacheManager } from "@/lib/cache-manager"

const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!)
const cache = new CacheManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageData, mimeType } = body

    if (!imageData || !mimeType) {
      return NextResponse.json({ success: false, error: "Image data and mime type required" }, { status: 400 })
    }

    // Generate cache key based on image hash (simplified)
    const imageHash = Buffer.from(imageData.substring(0, 100)).toString("base64")
    const cacheKey = cache.generateKey("alt-text", { imageHash, mimeType })

    // Check cache first
    const cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      })
    }

    // Generate alt text
    const result = await geminiClient.generateAltText(imageData, mimeType)

    // Cache successful results
    if (result.success) {
      cache.set(cacheKey, result, 30 * 60 * 1000) // 30 minutes
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Alt text generation API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate alt text",
        fallback: "Image description not available",
      },
      { status: 500 },
    )
  }
}
