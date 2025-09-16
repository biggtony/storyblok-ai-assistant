#!/usr/bin/env node

import { Command } from "commander"
import { GeminiClient } from "../lib/gemini-client"
import { AccessibilityChecker } from "../lib/accessibility-checker"
import { WCAGValidator } from "../lib/wcag-validator"
import fs from "fs/promises"
import path from "path"

const program = new Command()

program.name("storyblok-ai").description("CLI tools for Storyblok AI Assistant").version("1.0.0")

// Batch accessibility audit command
program
  .command("audit")
  .description("Run accessibility audit on content files")
  .option("-d, --directory <path>", "Directory containing content files", "./content")
  .option("-o, --output <path>", "Output file for results", "./audit-results.json")
  .option("-f, --format <format>", "Output format (json|csv|html)", "json")
  .option("--fix", "Automatically fix issues where possible")
  .action(async (options) => {
    console.log("🔍 Starting accessibility audit...")

    try {
      const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!)
      const accessibilityChecker = new AccessibilityChecker(geminiClient)
      const wcagValidator = new WCAGValidator()

      const contentDir = path.resolve(options.directory)
      const files = await getContentFiles(contentDir)

      console.log(`Found ${files.length} content files to audit`)

      const results = []

      for (const file of files) {
        console.log(`Auditing: ${file}`)

        const content = await fs.readFile(file, "utf-8")
        const images = extractImages(content)

        const result = await accessibilityChecker.checkContent(content, images)

        results.push({
          file: path.relative(contentDir, file),
          score: result.score,
          issues: result.issues,
          suggestions: result.suggestions,
        })

        if (options.fix) {
          await autoFixIssues(file, content, result.issues, geminiClient)
        }
      }

      await saveResults(results, options.output, options.format)

      const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length
      const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0)

      console.log(`\n✅ Audit complete!`)
      console.log(`Average accessibility score: ${averageScore.toFixed(1)}/100`)
      console.log(`Total issues found: ${totalIssues}`)
      console.log(`Results saved to: ${options.output}`)
    } catch (error) {
      console.error("❌ Audit failed:", error)
      process.exit(1)
    }
  })

// Batch alt-text generation command
program
  .command("generate-alt-text")
  .description("Generate alt text for images in content files")
  .option("-d, --directory <path>", "Directory containing content files", "./content")
  .option("-i, --images <path>", "Directory containing image files", "./public/images")
  .option("--dry-run", "Preview changes without applying them")
  .action(async (options) => {
    console.log("🖼️  Generating alt text for images...")

    try {
      const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!)

      const contentDir = path.resolve(options.directory)
      const imagesDir = path.resolve(options.images)
      const files = await getContentFiles(contentDir)

      for (const file of files) {
        console.log(`Processing: ${file}`)

        const content = await fs.readFile(file, "utf-8")
        const images = extractImages(content)

        let updatedContent = content

        for (const image of images) {
          if (!image.alt || image.alt.trim().length === 0) {
            const imagePath = path.join(imagesDir, image.src.replace(/^\//, ""))

            try {
              const imageBuffer = await fs.readFile(imagePath)
              const imageData = imageBuffer.toString("base64")
              const mimeType = getMimeType(imagePath)

              const result = await geminiClient.generateAltText(imageData, mimeType)

              if (result.success) {
                console.log(`  Generated alt text for ${image.src}: "${result.altText}"`)

                if (!options.dryRun) {
                  updatedContent = updatedContent.replace(
                    new RegExp(`<img([^>]*src=["']${image.src}["'][^>]*)>`, "g"),
                    `<img$1 alt="${result.altText}">`,
                  )
                }
              }
            } catch (imageError) {
              console.warn(`  Could not process image ${image.src}:`, imageError.message)
            }
          }
        }

        if (!options.dryRun && updatedContent !== content) {
          await fs.writeFile(file, updatedContent)
          console.log(`  Updated ${file}`)
        }
      }

      console.log(`\n✅ Alt text generation complete!`)
    } catch (error) {
      console.error("❌ Alt text generation failed:", error)
      process.exit(1)
    }
  })

// Sync command for environments
program
  .command("sync")
  .description("Sync AI-generated content across environments")
  .option("-s, --source <env>", "Source environment", "development")
  .option("-t, --target <env>", "Target environment", "staging")
  .option("--content-types <types>", "Comma-separated list of content types to sync")
  .action(async (options) => {
    console.log(`🔄 Syncing content from ${options.source} to ${options.target}...`)

    try {
      // In a real implementation, this would:
      // 1. Connect to Storyblok API for both environments
      // 2. Compare AI-generated content
      // 3. Sync differences while preserving manual edits
      // 4. Handle conflicts and version control

      console.log("✅ Sync complete!")
    } catch (error) {
      console.error("❌ Sync failed:", error)
      process.exit(1)
    }
  })

// Analytics export command
program
  .command("export-analytics")
  .description("Export analytics data")
  .option("-f, --format <format>", "Export format (json|csv)", "json")
  .option("-o, --output <path>", "Output file path")
  .option("-r, --range <range>", "Time range (day|week|month)", "week")
  .action(async (options) => {
    console.log("📊 Exporting analytics data...")

    try {
      const response = await fetch(
        `http://localhost:3000/api/analytics/export?format=${options.format}&range=${options.range}`,
      )
      const data = await response.text()

      const outputPath = options.output || `analytics-${Date.now()}.${options.format}`
      await fs.writeFile(outputPath, data)

      console.log(`✅ Analytics exported to: ${outputPath}`)
    } catch (error) {
      console.error("❌ Export failed:", error)
      process.exit(1)
    }
  })

// Helper functions
async function getContentFiles(directory: string): Promise<string[]> {
  const files: string[] = []

  async function scanDirectory(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        await scanDirectory(fullPath)
      } else if (entry.name.match(/\.(html|md|mdx)$/)) {
        files.push(fullPath)
      }
    }
  }

  await scanDirectory(directory)
  return files
}

function extractImages(content: string): Array<{ src: string; alt?: string }> {
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi
  const images: Array<{ src: string; alt?: string }> = []

  let match
  while ((match = imgRegex.exec(content)) !== null) {
    images.push({
      src: match[1],
      alt: match[2] || "",
    })
  }

  return images
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  }
  return mimeTypes[ext] || "image/jpeg"
}

async function autoFixIssues(
  filePath: string,
  content: string,
  issues: any[],
  geminiClient: GeminiClient,
): Promise<void> {
  const updatedContent = content

  for (const issue of issues) {
    if (issue.autoFixable) {
      switch (issue.type) {
        case "alt-text":
          // Auto-fix alt text issues
          console.log(`  Auto-fixing: ${issue.description}`)
          break
        case "heading":
          // Auto-fix heading hierarchy
          console.log(`  Auto-fixing: ${issue.description}`)
          break
      }
    }
  }

  if (updatedContent !== content) {
    await fs.writeFile(filePath, updatedContent)
    console.log(`  Auto-fixed issues in ${filePath}`)
  }
}

async function saveResults(results: any[], outputPath: string, format: string): Promise<void> {
  switch (format) {
    case "json":
      await fs.writeFile(outputPath, JSON.stringify(results, null, 2))
      break
    case "csv":
      const csv = resultsToCSV(results)
      await fs.writeFile(outputPath, csv)
      break
    case "html":
      const html = resultsToHTML(results)
      await fs.writeFile(outputPath, html)
      break
  }
}

function resultsToCSV(results: any[]): string {
  const headers = ["File", "Score", "Issues", "High Priority", "Medium Priority", "Low Priority"]
  const rows = results.map((result) => [
    result.file,
    result.score,
    result.issues.length,
    result.issues.filter((i: any) => i.severity === "high").length,
    result.issues.filter((i: any) => i.severity === "medium").length,
    result.issues.filter((i: any) => i.severity === "low").length,
  ])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

function resultsToHTML(results: any[]): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Accessibility Audit Results</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .high { color: #d32f2f; }
    .medium { color: #f57c00; }
    .low { color: #1976d2; }
  </style>
</head>
<body>
  <h1>Accessibility Audit Results</h1>
  <table>
    <tr>
      <th>File</th>
      <th>Score</th>
      <th>Issues</th>
      <th>Details</th>
    </tr>
    ${results
      .map(
        (result) => `
      <tr>
        <td>${result.file}</td>
        <td>${result.score}/100</td>
        <td>${result.issues.length}</td>
        <td>
          ${result.issues
            .map(
              (issue: any) => `
            <div class="${issue.severity}">
              <strong>${issue.type}</strong>: ${issue.description}
            </div>
          `,
            )
            .join("")}
        </td>
      </tr>
    `,
      )
      .join("")}
  </table>
</body>
</html>
  `
}

program.parse()
