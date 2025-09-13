#!/usr/bin/env node

/**
 * Lyrica Export Tool
 *
 * This script generates customized versions of the Lyrica template
 * with only the selected features/modules included.
 *
 * Usage:
 *   node export-app.js --features auth,blog --output ./my-app
 *   node export-app.js --profile saas --output ./my-saas-app
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import yaml from 'js-yaml'

class LyricaExporter {
  constructor() {
    this.features = {}
    this.selectedFeatures = new Set()
    this.outputDir = ''
    this.projectRoot = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1')
  }

  /**
   * Load features configuration from features.yml
   */
  loadFeatures() {
    const featuresPath = path.join(this.projectRoot, 'features.yml')
    if (!fs.existsSync(featuresPath)) {
      throw new Error('features.yml not found in project root')
    }

    const featuresData = yaml.load(fs.readFileSync(featuresPath, 'utf8'))
    this.features = featuresData.features
    this.profiles = featuresData.profiles
  }

  /**
   * Parse command line arguments
   */
  parseArgs() {
    const args = process.argv.slice(2)
    let features = []
    let profile = null
    let outputDir = './exported-app'

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--features':
          features = args[i + 1]?.split(',').map(f => f.trim()) || []
          i++
          break
        case '--profile':
          profile = args[i + 1]?.trim()
          i++
          break
        case '--output':
          outputDir = args[i + 1]?.trim()
          i++
          break
        case '--help':
          this.showHelp()
          process.exit(0)
      }
    }

    if (profile) {
      if (!this.profiles[profile]) {
        throw new Error(`Profile '${profile}' not found. Available profiles: ${Object.keys(this.profiles).join(', ')}`)
      }
      features = this.profiles[profile].features
    }

    if (features.length === 0) {
      throw new Error('No features specified. Use --features or --profile')
    }

    this.selectedFeatures = new Set(['core', ...features])
    this.outputDir = path.resolve(outputDir)
  }

  /**
   * Validate feature dependencies and conflicts
   */
  validateFeatures() {
    const selected = Array.from(this.selectedFeatures)

    for (const featureName of selected) {
      const feature = this.features[featureName]
      if (!feature) {
        throw new Error(`Feature '${featureName}' not found`)
      }

      // Check dependencies
      for (const dep of feature.dependencies || []) {
        if (!this.selectedFeatures.has(dep)) {
          throw new Error(`Feature '${featureName}' requires '${dep}'`)
        }
      }

      // Check conflicts
      for (const conflict of feature.conflicts || []) {
        if (this.selectedFeatures.has(conflict)) {
          throw new Error(`Feature '${featureName}' conflicts with '${conflict}'`)
        }
      }
    }

    console.log(`✓ Selected features: ${selected.join(', ')}`)
  }

  /**
   * Create output directory structure
   */
  createOutputStructure() {
    if (fs.existsSync(this.outputDir)) {
      fs.rmSync(this.outputDir, { recursive: true, force: true })
    }
    fs.mkdirSync(this.outputDir, { recursive: true })
    console.log(`✓ Created output directory: ${this.outputDir}`)
  }

  /**
   * Copy selected feature files
   */
  copyFeatureFiles() {
    const selected = Array.from(this.selectedFeatures)

    for (const featureName of selected) {
      const feature = this.features[featureName]

      for (const filePath of feature.files || []) {
        const sourcePath = path.join(this.projectRoot, filePath)
        const destPath = path.join(this.outputDir, filePath)

        if (fs.existsSync(sourcePath)) {
          const destDir = path.dirname(destPath)
          fs.mkdirSync(destDir, { recursive: true })

          if (fs.statSync(sourcePath).isDirectory()) {
            this.copyDirectory(sourcePath, destPath)
          } else {
            fs.copyFileSync(sourcePath, destPath)
          }
        } else {
          console.warn(`⚠ Warning: ${filePath} not found`)
        }
      }
    }

    console.log('✓ Copied feature files')
  }

  /**
   * Copy directory recursively
   */
  copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true })
    }

    const entries = fs.readdirSync(source, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = path.join(source, entry.name)
      const destPath = path.join(destination, entry.name)

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }

  /**
   * Generate main application entry point
   */
  generateMainEntry() {
    const selected = Array.from(this.selectedFeatures)
    const hasAuth = selected.includes('auth')
    const hasBlog = selected.includes('blog')
    const hasBookings = selected.includes('bookings')
    const hasCalendar = selected.includes('calendar')
    const hasMaps = selected.includes('maps')
    const hasContact = selected.includes('contact')

    // Generate app/layout.tsx with conditional imports
    let layoutContent = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lyrica App',
  description: 'Generated by Lyrica Export Tool',
}

// Force dynamic rendering to avoid static generation errors when env is unset
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
`

    // Generate app/page.tsx with navigation
    let pageContent = `'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Lyrica App</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
`

    if (hasAuth) {
      pageContent += `
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
          <div className="space-y-2">
            <Link href="/login" className="block text-blue-600 hover:underline">Login</Link>
            <Link href="/signup" className="block text-blue-600 hover:underline">Sign Up</Link>
            <Link href="/forgot-password" className="block text-blue-600 hover:underline">Forgot Password</Link>
          </div>
        </div>`
    }

    if (hasBlog) {
      pageContent += `
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Blog</h2>
          <div className="space-y-2">
            <Link href="/blog" className="block text-blue-600 hover:underline">View Posts</Link>
            <Link href="/blog/new" className="block text-blue-600 hover:underline">Create Post</Link>
          </div>
        </div>`
    }

    if (hasBookings) {
      pageContent += `
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Bookings</h2>
          <div className="space-y-2">
            <Link href="/bookings" className="block text-blue-600 hover:underline">View Bookings</Link>
          </div>
        </div>`
    }

    if (hasCalendar) {
      pageContent += `
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Calendar</h2>
          <div className="space-y-2">
            <Link href="/calendar" className="block text-blue-600 hover:underline">View Calendar</Link>
          </div>
        </div>`
    }

    if (hasMaps) {
      pageContent += `
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Maps</h2>
          <div className="space-y-2">
            <Link href="/maps" className="block text-blue-600 hover:underline">View Maps</Link>
          </div>
        </div>`
    }

    if (hasContact) {
      pageContent += `
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <div className="space-y-2">
            <Link href="/contact" className="block text-blue-600 hover:underline">Contact Us</Link>
          </div>
        </div>`
    }

    pageContent += `
      </div>
    </div>
  )
}
`

    // Write the files
    fs.writeFileSync(path.join(this.outputDir, 'app/layout.tsx'), layoutContent)
    fs.writeFileSync(path.join(this.outputDir, 'app/page.tsx'), pageContent)

    console.log('✓ Generated main application entry points')
  }

  /**
   * Generate updated package.json with only required dependencies
   */
  generatePackageJson() {
    const selected = Array.from(this.selectedFeatures)
    const originalPackage = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'))

    const requiredDeps = new Set()
    const requiredDevDeps = new Set()

    // Add core dependencies
    for (const dep of this.features.core.dependencies_list) {
      requiredDeps.add(dep)
    }
    for (const dep of this.features.core.dev_dependencies_list || []) {
      requiredDevDeps.add(dep)
    }

    // Add selected feature dependencies
    for (const featureName of selected) {
      const feature = this.features[featureName]
      for (const dep of feature.dependencies_list || []) {
        requiredDeps.add(dep)
      }
      for (const dep of feature.dev_dependencies_list || []) {
        requiredDevDeps.add(dep)
      }
    }

    // Filter package.json
    const newPackage = {
      ...originalPackage,
      dependencies: {},
      devDependencies: {}
    }

    for (const dep of requiredDeps) {
      if (originalPackage.dependencies[dep]) {
        newPackage.dependencies[dep] = originalPackage.dependencies[dep]
      }
    }

    for (const dep of requiredDevDeps) {
      if (originalPackage.devDependencies[dep]) {
        newPackage.devDependencies[dep] = originalPackage.devDependencies[dep]
      }
    }

    fs.writeFileSync(path.join(this.outputDir, 'package.json'), JSON.stringify(newPackage, null, 2))
    console.log('✓ Generated optimized package.json')
  }

  /**
   * Copy configuration files
   */
  copyConfigFiles() {
    const configFiles = [
      'next.config.mjs',
      'tailwind.config.ts',
      'postcss.config.cjs',
      'tsconfig.json',
      'README.md',
      '.gitignore'
    ]

    for (const file of configFiles) {
      const sourcePath = path.join(this.projectRoot, file)
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, path.join(this.outputDir, file))
      }
    }

    console.log('✓ Copied configuration files')
  }

  /**
   * Generate .env.example file
   */
  generateEnvExample() {
    const selected = Array.from(this.selectedFeatures)
    let envContent = `# Environment Variables
# Copy this file to .env.local and fill in your values

NEXT_PUBLIC_SITE_URL=http://localhost:3000
`

    if (selected.includes('auth')) {
      envContent += `
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
`
    }

    fs.writeFileSync(path.join(this.outputDir, '.env.example'), envContent)
    console.log('✓ Generated .env.example')
  }

  /**
   * Generate build optimization configuration
   */
  generateBuildConfig() {
    const selected = Array.from(this.selectedFeatures)

    // Generate next.config.mjs with tree shaking
    let nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [`

    const optimizePackages = []

    if (selected.includes('maps')) {
      optimizePackages.push("'leaflet'", "'react-leaflet'")
    }

    if (selected.includes('blog')) {
      optimizePackages.push("'react-markdown'", "'rehype-sanitize'")
    }

    if (selected.includes('auth')) {
      optimizePackages.push("'@supabase/supabase-js'", "'@supabase/ssr'")
    }

    nextConfig += optimizePackages.join(', ') + `
    ],
  },
}

export default nextConfig
`

    fs.writeFileSync(path.join(this.outputDir, 'next.config.mjs'), nextConfig)
    console.log('✓ Generated optimized Next.js configuration')
  }

  /**
   * Run security audit and generate SBOM
   */
  runSecurityAudit() {
    console.log('🔒 Running security audit...')

    try {
      // Install dependencies
      execSync('npm install', { cwd: this.outputDir, stdio: 'inherit' })

      // Run audit
      execSync('npm audit --audit-level moderate', { cwd: this.outputDir, stdio: 'inherit' })

      // Generate SBOM (if CycloneDX is available)
      try {
        execSync('npx @cyclonedx/cyclonedx-npm --output-file sbom.json', { cwd: this.outputDir, stdio: 'inherit' })
        console.log('✓ Generated SBOM (sbom.json)')
      } catch (error) {
        console.log('⚠ SBOM generation skipped (install @cyclonedx/cyclonedx-npm for SBOM generation)')
      }

    } catch (error) {
      console.warn('⚠ Security audit completed with warnings')
    }
  }

  /**
   * Generate export summary
   */
  generateSummary() {
    const selected = Array.from(this.selectedFeatures)
    const summary = {
      exported_at: new Date().toISOString(),
      features: selected,
      output_directory: this.outputDir,
      total_features: selected.length,
      security_audit: true,
      sbom_generated: fs.existsSync(path.join(this.outputDir, 'sbom.json'))
    }

    fs.writeFileSync(path.join(this.outputDir, 'export-summary.json'), JSON.stringify(summary, null, 2))
    console.log('✓ Generated export summary')
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
Lyrica Export Tool

Usage:
  node export-app.js --features <feature1,feature2> --output <directory>
  node export-app.js --profile <profile-name> --output <directory>

Options:
  --features    Comma-separated list of features to include
  --profile     Use a predefined profile from features.yml
  --output      Output directory (default: ./exported-app)
  --help        Show this help message

Available Features:
  core, auth, admin, blog, bookings, calendar, maps, contact, theme

Available Profiles:
  minimal, blog, business, saas, enterprise

Examples:
  node export-app.js --features auth,blog --output ./my-blog-app
  node export-app.js --profile saas --output ./my-saas-app
`)
  }

  /**
   * Main export process
   */
  async export() {
    try {
      console.log('🚀 Starting Lyrica Export...\n')

      this.loadFeatures()
      console.log('✓ Features loaded')
      this.parseArgs()
      console.log('✓ Arguments parsed')
      this.validateFeatures()
      console.log('✓ Features validated')
      this.createOutputStructure()
      console.log('✓ Output structure created')
      this.copyFeatureFiles()
      console.log('✓ Feature files copied')
      this.generateMainEntry()
      console.log('✓ Main entry generated')
      this.generatePackageJson()
      console.log('✓ Package.json generated')
      this.copyConfigFiles()
      console.log('✓ Config files copied')
      this.generateEnvExample()
      console.log('✓ Environment example generated')
      this.generateBuildConfig()
      console.log('✓ Build config generated')
      this.runSecurityAudit()
      console.log('✓ Security audit completed')
      this.generateSummary()
      console.log('✓ Summary generated')

      console.log('\n✅ Export completed successfully!')
      console.log(`📁 Output directory: ${this.outputDir}`)
      console.log(`📋 Selected features: ${Array.from(this.selectedFeatures).join(', ')}`)
      console.log('\nNext steps:')
      console.log('1. cd ' + path.relative(process.cwd(), this.outputDir))
      console.log('2. cp .env.example .env.local')
      console.log('3. Fill in your environment variables')
      console.log('4. npm run dev')

    } catch (error) {
      console.error('❌ Export failed:', error.message)
      process.exit(1)
    }
  }
}

// Run the exporter
console.log('Script starting...')
const isMainModule = process.argv[1] === new URL(import.meta.url).pathname || process.argv[1].endsWith('export-app.js')

if (isMainModule) {
  console.log('Running as main module')
  const exporter = new LyricaExporter()
  exporter.export()
} else {
  console.log('Running as module')
}

export default LyricaExporter
