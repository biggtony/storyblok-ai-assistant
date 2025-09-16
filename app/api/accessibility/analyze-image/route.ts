import { type NextRequest, NextResponse } from "next/server"
import { GeminiClient } from "@/lib/gemini-client"
import { ImageAnalyzer } from "@/lib/image-analyzer"
import { CacheManager } from "@/lib/cache-manager"

const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!)
const imageAnalyzer = new ImageAnalyzer(geminiClient)
const cache = new CacheManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageData, mimeType, context, analysisType = "full" } = body

    if (!imageData || !mimeType) {
      return NextResponse.json({ success: false, error: "Image data and mime type required" }, { status: 400 })
    }

    // Generate cache key
    const imageHash = Buffer.from(imageData.substring(0, 100)).toString("base64")
    const cacheKey = cache.generateKey("image-analysis", {
      imageHash,
      mimeType,
      analysisType,
      context: context?.substring(0, 50) || "",
    })

    // Check cache first
    const cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        ...cachedResult,
        cached: true,
      })
    }

    let result

    switch (analysisType) {
      case "full":
        result = await imageAnalyzer.analyzeImage(imageData, mimeType, context)
        break

      case "alt-text":
        const altText = await imageAnalyzer.generateContextualAltText(imageData, mimeType, context || "", "informative")
        result = { altText }
        break

      case "text-detection":
        result = await imageAnalyzer.detectTextInImage(imageData, mimeType)
        break

      case "decorative-check":
        const isDecorative = await imageAnalyzer.isImageDecorative(imageData, mimeType, context || "")
        result = { decorative: isDecorative }
        break

      default:
        return NextResponse.json({ success: false, error: "Invalid analysis type" }, { status: 400 })
    }

    // Cache successful results
    cache.set(cacheKey, result, 30 * 60 * 1000) // 30 minutes

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Image analysis API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze image",
      },
      { status: 500 },
    )
  }
}
