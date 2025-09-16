# Contributing Guide

## Development Setup

1. **Fork and Clone**
   \`\`\`bash
   git clone https://github.com/your-username/storyblok-ai-assistant.git
   cd storyblok-ai-assistant
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   cp .env.example .env.local
   # Add your API keys
   \`\`\`

4. **Start Development**
   \`\`\`bash
   npm run dev
   npm run plugin:dev
   \`\`\`

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper error handling with try/catch blocks
- Document complex functions with JSDoc comments

### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility best practices
- Use semantic HTML elements

### Testing
- Write unit tests for all utility functions
- Include integration tests for API endpoints
- Test accessibility checker rules thoroughly
- Mock external API calls in tests

### Git Workflow

1. **Create Feature Branch**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

2. **Make Changes**
   - Follow code standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Commit Changes**
   \`\`\`bash
   git add .
   git commit -m "feat: add new accessibility rule for form labels"
   \`\`\`

4. **Push and Create PR**
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`

## Pull Request Guidelines

- Provide clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed
- Request review from maintainers

## Reporting Issues

When reporting bugs:
- Include steps to reproduce
- Provide error messages and logs
- Specify browser and Storyblok versions
- Include relevant configuration details

## Feature Requests

For new features:
- Describe the use case clearly
- Explain how it improves accessibility or content creation
- Consider impact on existing functionality
- Provide mockups or examples if applicable
