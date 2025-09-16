# Deployment Guide

## Prerequisites

- Node.js 18+
- Vercel account (recommended) or other hosting platform
- Storyblok space with admin access
- Google Gemini API key

## Environment Setup

### 1. Environment Variables

Create production environment variables:

\`\`\`env
# Required
GEMINI_API_KEY=your_production_gemini_key
STORYBLOK_ACCESS_TOKEN=your_storyblok_access_token
STORYBLOK_PREVIEW_TOKEN=your_storyblok_preview_token

# Optional
NEXT_PUBLIC_APP_URL=https://your-domain.com
ANALYTICS_API_KEY=your_analytics_key
NODE_ENV=production
\`\`\`

### 2. Build Configuration

Update `next.config.mjs` for production:

\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

export default nextConfig
\`\`\`

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   \`\`\`bash
   vercel login
   vercel link
   \`\`\`

2. **Configure Environment Variables**
   \`\`\`bash
   vercel env add GEMINI_API_KEY
   vercel env add STORYBLOK_ACCESS_TOKEN
   vercel env add STORYBLOK_PREVIEW_TOKEN
   \`\`\`

3. **Deploy**
   \`\`\`bash
   vercel deploy --prod
   \`\`\`

### Option 2: Docker

1. **Create Dockerfile**
   \`\`\`dockerfile
   FROM node:18-alpine AS base
   
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci
   
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   \`\`\`

2. **Build and Run**
   \`\`\`bash
   docker build -t storyblok-ai-assistant .
   docker run -p 3000:3000 --env-file .env storyblok-ai-assistant
   \`\`\`

## Storyblok Configuration

### 1. Upload Plugin

1. **Build Plugin**
   \`\`\`bash
   npm run plugin:build
   \`\`\`

2. **Upload to Storyblok**
   - Go to Settings > Field-type plugins
   - Click "New field-type plugin"
   - Upload the built plugin files
   - Set the plugin URL to your deployed endpoint

### 2. Configure Components

Add the AI Assistant field to your components:

\`\`\`json
{
  "name": "ai_assistant",
  "display_name": "AI Assistant",
  "type": "plugin",
  "field_type": "storyblok-ai-assistant",
  "options": []
}
\`\`\`

### 3. Set Permissions

Configure user permissions in Storyblok:
- Enable plugin access for content editors
- Set appropriate role permissions for AI features
- Configure accessibility checking permissions

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test Gemini API connectivity
- [ ] Confirm Storyblok plugin loads correctly
- [ ] Validate accessibility checker functionality
- [ ] Test analytics dashboard access
- [ ] Verify CLI tools work in production
- [ ] Check multi-user collaboration features
- [ ] Test fallback mechanisms

## Monitoring and Maintenance

### Health Checks

The application includes health check endpoints:
- `/api/health` - General application health
- `/api/health/gemini` - Gemini API connectivity
- `/api/health/storyblok` - Storyblok integration status

### Logging

Monitor these key metrics:
- AI suggestion acceptance rates
- Accessibility issue detection and resolution
- API response times and error rates
- User engagement with plugin features

### Updates

Regular maintenance tasks:
- Update Gemini API client library
- Monitor Storyblok API changes
- Update accessibility rules for WCAG compliance
- Review and update AI prompts for better suggestions

## Troubleshooting

### Common Issues

1. **Plugin not loading in Storyblok**
   - Check plugin URL configuration
   - Verify CORS settings
   - Confirm plugin build completed successfully

2. **Gemini API errors**
   - Validate API key permissions
   - Check rate limiting settings
   - Verify network connectivity

3. **Accessibility checker false positives**
   - Review WCAG rule configurations
   - Update image analysis prompts
   - Check color contrast calculation accuracy

For additional support, refer to the troubleshooting section in the main README.
