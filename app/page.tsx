import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Eye, 
  Users, 
  BarChart3, 
  Terminal, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Storyblok AI Assistant</h1>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">v1.0.0</Badge>
              <Badge variant="outline">Powered by Gemini</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            AI-Powered Content Generation & 
            <span className="text-primary"> Accessibility Assistant</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Deeply integrated with Storyblok's Visual Editor. Get real-time, context-aware content suggestions 
            and automated accessibility enhancements powered by Google DeepMind's Gemini API.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/analytics">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                View Analytics Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" asChild>
              <a href="https://github.com/biggtony/storyblok-ai-assistant" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* AI Content Generation */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <CardTitle>AI Content Generation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Context-aware content suggestions powered by Gemini API with customizable tone and style.
              </CardDescription>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Multiple content types
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Real-time generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Confidence scoring
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Accessibility Assistant */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                <CardTitle>Accessibility Assistant</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                WCAG 2.1 Level AA compliance checking with automated alt-text generation.
              </CardDescription>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Color contrast validation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Semantic structure analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  ARIA attribute verification
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Collaboration Features */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle>Collaboration Features</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Multi-user support with real-time presence indicators and conflict resolution.
              </CardDescription>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Real-time presence
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Conflict detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Team preferences sync
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Analytics Dashboard */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <CardTitle>Analytics Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Comprehensive insights into AI adoption, accessibility improvements, and team productivity.
              </CardDescription>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  AI adoption metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Usage patterns
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Exportable reports
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CLI Tools */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Terminal className="h-6 w-6 text-primary" />
                <CardTitle>CLI Tools</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Powerful command-line tools for batch operations and automated workflows.
              </CardDescription>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Batch accessibility audits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Automated alt-text generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Content synchronization
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle>System Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Current system status and integration health.
              </CardDescription>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Gemini API</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {process.env.GEMINI_API_KEY ? 'Connected' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Storyblok</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {process.env.STORYBLOK_PREVIEW_TOKEN ? 'Connected' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Deployment</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Live
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Built with ❤️ for the Storyblok community
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="https://github.com/biggtony/storyblok-ai-assistant" className="hover:text-primary">
                GitHub
              </a>
              <Link href="/analytics" className="hover:text-primary">
                Analytics
              </Link>
              <span>Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
