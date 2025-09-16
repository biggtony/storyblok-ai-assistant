import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'storyblok-ai-assistant',
    version: '1.0.0',
    endpoints: {
      'ai/generate-content': 'POST - Generate AI content',
      'accessibility/check': 'POST - Check accessibility',
      'ai/generate-alt-text': 'POST - Generate alt text'
    }
  })
}
