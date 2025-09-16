# Storyblok AI Assistant

An innovative AI-powered content generation and accessibility assistant deeply integrated with Storyblok's Visual Editor. Powered by Google DeepMind's Gemini API, this solution provides real-time, context-aware content suggestions and automated accessibility enhancements.

## 🚀 Features

### AI Content Generation
- **Context-aware suggestions** powered by Gemini API
- **Multiple content types** (headings, paragraphs, lists, quotes)
- **Customizable tone and style** (professional, casual, creative, etc.)
- **Real-time generation** with fallback mechanisms
- **Confidence scoring** for suggestion quality

### Accessibility Assistant
- **WCAG 2.1 Level AA compliance** checking
- **Automated alt-text generation** using Gemini's vision capabilities
- **Color contrast validation**
- **Semantic structure analysis**
- **ARIA attribute verification**
- **Real-time accessibility scoring**

### Collaboration Features
- **Multi-user support** with real-time presence indicators
- **Conflict detection and resolution** for simultaneous edits
- **Version control** for AI suggestions
- **Team preference synchronization**
- **Activity sharing** and notifications

### Analytics Dashboard
- **AI adoption metrics** (acceptance rates, confidence scores)
- **Accessibility improvement tracking**
- **Usage patterns and feature analytics**
- **Team productivity insights**
- **Exportable reports** (JSON, CSV, HTML)

### CLI Tools
- **Batch accessibility audits** across content files
- **Automated alt-text generation** for image libraries
- **Content synchronization** between environments
- **Analytics data export** and reporting

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Storyblok account with API access
- Google Gemini API key

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-org/storyblok-ai-assistant.git
   cd storyblok-ai-assistant
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Update `.env` with your API keys:
   \`\`\`env
   GEMINI_API_KEY=your_gemini_api_key_here
   STORYBLOK_ACCESS_TOKEN=your_storyblok_access_token_here
   STORYBLOK_PREVIEW_TOKEN=your_storyblok_preview_token_here
   \`\`\`

4. **Build the plugin**
   \`\`\`bash
   npm run plugin:build
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🔧 Configuration

### Storyblok Plugin Setup

1. **Upload the plugin** to your Storyblok space
2. **Configure the field plugin** in your component schema
3. **Set the plugin URL** to your deployed instance

### Gemini API Setup

1. **Get API key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Enable required models**:
   - `gemini-1.5-flash` (text generation)
   - `gemini-1.5-flash` (vision analysis)

## 📖 Usage

### Basic Usage

1. **Open Storyblok Visual Editor**
2. **Navigate to a content block** with the AI Assistant field
3. **Choose your desired action**:
   - Generate AI content suggestions
   - Run accessibility checks
   - Configure preferences

### AI Content Generation

\`\`\`typescript
// Example: Generate a blog post introduction
const context = {
  contentType: "paragraph",
  existingContent: "This article discusses sustainable energy solutions...",
  tone: "professional",
  style: "engaging",
  length: "medium"
}

// The AI will generate contextual suggestions based on your input
\`\`\`

### Accessibility Checking

The assistant automatically:
- Analyzes content structure and semantics
- Generates alt-text for images using AI vision
- Validates color contrast ratios
- Checks ARIA attributes and roles
- Provides actionable improvement suggestions

### CLI Usage

\`\`\`bash
# Run accessibility audit
npx storyblok-ai audit --directory ./content --output ./audit-results.json

# Generate alt-text for images
npx storyblok-ai generate-alt-text --directory ./content --images ./public/images

# Export analytics
npx storyblok-ai export-analytics --format csv --range week
\`\`\`

## 🏗️ Architecture

### Core Components

\`\`\`
├── lib/
│   ├── gemini-client.ts          # Gemini API integration
│   ├── accessibility-checker.ts   # WCAG compliance engine
│   ├── wcag-validator.ts          # WCAG rule validation
│   ├── image-analyzer.ts          # AI-powered image analysis
│   ├── collaboration-manager.ts   # Multi-user coordination
│   └── analytics-collector.ts     # Usage tracking
├── plugin/
│   └── src/
│       ├── components/            # React plugin components
│       └── main.tsx              # Plugin entry point
├── app/
│   ├── analytics/                # Analytics dashboard
│   └── api/                      # API endpoints
└── cli/
    └── storyblok-ai-cli.ts       # Command-line tools
\`\`\`

### Data Flow

1. **User Input** → Plugin Interface
2. **Content Analysis** → Gemini API
3. **Accessibility Check** → WCAG Validator + AI Analysis
4. **Results Processing** → Cache + Analytics
5. **UI Updates** → Real-time Collaboration

## 🧪 Testing

### Running Tests

\`\`\`bash
# Run all tests
npm test

# Run specific test suites
npm test -- --grep "Gemini Client"
npm test -- --grep "Accessibility"
npm test -- --grep "Collaboration"

# Run with coverage
npm run test:coverage
\`\`\`

### Test Structure

- **Unit Tests**: Individual component functionality
- **Integration Tests**: API interactions and data flow
- **E2E Tests**: Complete user workflows
- **Accessibility Tests**: WCAG compliance validation

## 📊 Analytics & Monitoring

### Key Metrics

- **AI Adoption Rate**: Percentage of suggestions accepted
- **Accessibility Score**: Average WCAG compliance rating
- **User Engagement**: Session duration and feature usage
- **Team Productivity**: Collaborative actions completed

### Dashboard Features

- Real-time metrics visualization
- Historical trend analysis
- Exportable reports
- Team performance insights

## 🔒 Privacy & Security

### Data Handling

- **Privacy-compliant** analytics collection
- **Anonymized** user interaction data
- **Secure API** communication with encryption
- **Local caching** with automatic cleanup

### Security Measures

- API key encryption and secure storage
- Rate limiting for API requests
- Input validation and sanitization
- CORS protection for cross-origin requests

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy to Vercel** (recommended)
   \`\`\`bash
   vercel deploy
   \`\`\`

3. **Configure environment variables** in your deployment platform

4. **Update Storyblok plugin URL** to production endpoint

### Environment Configuration

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live deployment with monitoring

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Conventional Commits** for commit messages

## 📚 API Reference

### Gemini Client

\`\`\`typescript
class GeminiClient {
  generateContentBlock(context: ContentContext): Promise<ContentResult>
  generateAltText(imageData: string, mimeType: string): Promise<AltTextResult>
  analyzeContentAccessibility(content: string): Promise<AccessibilityResult>
}
\`\`\`

### Accessibility Checker

\`\`\`typescript
class AccessibilityChecker {
  checkContent(content: string, images?: Image[]): Promise<AccessibilityReport>
  generateAltText(imageData: string, mimeType: string): Promise<string>
}
\`\`\`

### Analytics Collector

\`\`\`typescript
class AnalyticsCollector {
  track(eventType: EventType, data: EventData): void
  getMetrics(timeRange: TimeRange): AnalyticsMetrics
  exportData(format: ExportFormat): string
}
\`\`\`

## 🐛 Troubleshooting

### Common Issues

**Plugin not loading**
- Verify Storyblok plugin URL is correct
- Check browser console for errors
- Ensure API keys are properly configured

**AI suggestions not generating**
- Confirm Gemini API key is valid
- Check API rate limits
- Verify network connectivity

**Accessibility checks failing**
- Ensure content is properly formatted
- Check for unsupported content types
- Review error logs for specific issues

### Debug Mode

Enable debug logging:
\`\`\`env
NODE_ENV=development
DEBUG=storyblok-ai:*
\`\`\`

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google DeepMind** for Gemini API
- **Storyblok** for the headless CMS platform
- **WCAG Working Group** for accessibility standards
- **Open source community** for tools and libraries

## 📞 Support

- **Documentation**: [docs.example.com](https://docs.example.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/storyblok-ai-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/storyblok-ai-assistant/discussions)
- **Email**: support@example.com

---

**Built with ❤️ for the Storyblok community**
