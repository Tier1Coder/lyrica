# LyriThe export system consists of:

1. **Feature Definitions** (`export-tool/features.yml`) - Defines all available features, their dependencies, and conflicts
2. **Modular Structure** (`modules/`) - Organized feature modules
3. **Export Script** (`export-tool/export-app.js`) - Node.js script to generate customized applications
4. **CI/CD Integration** (`export-tool/.github/workflows/export.yml`) - Automated export and deployment (optional - removed for solo development)

This document describes the modular export system for the Lyrica Next.js template, which allows you to generate customized versions of your application with only the features you need.

## Overview

The export system consists of:

1. **Feature Definitions** (`features.yml`) - Defines all available features, their dependencies, and conflicts
2. **Modular Structure** (`modules/`) - Organized feature modules
3. **Export Script** (`export-app.js`) - Node.js script to generate customized applications
4. **CI/CD Integration** (`.github/workflows/export.yml`) - Automated export and deployment (optional - removed for solo development)

## Features Configuration

### features.yml Structure

```yaml
# Located at: export-tool/features.yml
features:
  core:
    name: "Core Application"
    description: "Essential Next.js application structure"
    required: true
    dependencies: []
    conflicts: []
    files:
      - "app/layout.tsx"
      - "app/page.tsx"
      # ... more files
    dependencies_list:
      - "next"
      - "react"
      # ... more deps

  auth:
    name: "Authentication System"
    description: "User authentication with Supabase"
    required: false
    dependencies: ["core"]
    conflicts: []
    files: [...]
    dependencies_list: [...]

profiles:
  minimal:
    name: "Minimal"
    description: "Basic application with authentication"
    features: ["core", "auth"]

  saas:
    name: "SaaS Platform"
    description: "Full application with all features"
    features: ["core", "auth", "admin", "blog", "bookings", "calendar", "maps", "contact", "theme"]
```

## Usage

### Basic Export

```bash
# Export with specific features
node export-app.js --features auth,blog --output ./my-app

# Export using a predefined profile
node export-app.js --profile saas --output ./my-saas-app
```

### Available Features

- **core** - Essential Next.js structure (always included)
- **auth** - Authentication with Supabase
- **admin** - Admin dashboard and user management
- **blog** - Markdown-based blog system
- **bookings** - Event booking and reservation system
- **calendar** - Calendar view and functionality
- **maps** - Interactive maps with Leaflet
- **contact** - Contact forms and messaging
- **theme** - Dark/light theme toggle

### Available Profiles

- **minimal** - Core + Authentication
- **blog** - Core + Auth + Blog + Theme
- **business** - Core + Contact + Maps + Calendar + Theme
- **saas** - Full-featured SaaS platform
- **enterprise** - Complete enterprise solution

## Build Optimization

### Tree Shaking Configuration

The export system automatically configures Next.js for optimal tree shaking:

```javascript
// next.config.mjs (generated)
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'leaflet',
      'react-leaflet',
      '@supabase/supabase-js',
      // ... other packages
    ],
  },
}
```

### Bundle Analysis

To analyze bundle sizes after export:

```bash
cd exported-app
npm install --save-dev @next/bundle-analyzer

# Add to package.json scripts
"analyze": "ANALYZE=true npm run build"

npm run analyze
```

## Security Practices

### Automated Security Audit

The export process includes:

1. **Dependency Audit**: `npm audit --audit-level moderate`
2. **SBOM Generation**: CycloneDX SBOM in JSON format
3. **Vulnerability Scanning**: Automated checks for known vulnerabilities

### Environment Variables

Generated `.env.example` includes only required variables:

```bash
# For auth-enabled apps
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Always included
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Dependency Minimization

- Only required dependencies are included in `package.json`
- Unused packages are automatically removed
- Dev dependencies are filtered based on selected features

## CI/CD Integration

### GitHub Actions Workflow

The included workflow (`.github/workflows/export.yml`) provides:

1. **Manual Trigger**: Export any profile or custom feature set
2. **Automated Testing**: Build verification and security audit
3. **Artifact Generation**: Compressed archives for deployment
4. **Demo Deployment**: Automatic Vercel deployment for demo profiles

### Workflow Triggers

```yaml
on:
  workflow_dispatch:
    inputs:
      profile:
        description: 'Export profile to use'
        required: true
        options: [minimal, blog, business, saas, enterprise]
      features:
        description: 'Custom features (optional)'
      version:
        description: 'Version tag'
```

## Advanced Usage

### Custom Feature Definitions

Add new features to `features.yml`:

```yaml
custom_feature:
  name: "Custom Feature"
  description: "My custom functionality"
  required: false
  dependencies: ["core"]
  conflicts: []
  files:
    - "app/custom/page.tsx"
    - "components/CustomComponent.tsx"
  dependencies_list:
    - "custom-package"
```

### Module Organization

Features are organized in the `modules/` directory:

```
modules/
├── auth/
│   ├── app/
│   ├── components/
│   └── lib/
├── blog/
│   ├── app/
│   └── api/
└── maps/
    ├── components/
    └── lib/
```

### Extending the Export Script

The export script can be extended by modifying `export-app.js`:

```javascript
class LyricaExporter {
  // Add custom methods here
  customPostProcessing() {
    // Your custom logic
  }
}
```

## Deployment

### Local Development

```bash
cd exported-app
cp .env.example .env.local
# Edit .env.local with your values
npm install
npm run dev
```

### Production Deployment

```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **Missing Dependencies**
   - Check `export-summary.json` for included features
   - Verify `features.yml` has correct `dependencies_list`

2. **Build Failures**
   - Ensure all required environment variables are set
   - Check that all feature files exist in the source

3. **Security Audit Failures**
   - Update vulnerable dependencies in the source
   - Review `npm audit` output for remediation steps

### Debug Mode

Enable debug logging:

```bash
DEBUG=lyrica-export node export-app.js --profile minimal --output ./debug-app
```

## Best Practices

### Feature Design

1. **Clear Dependencies**: Define all required dependencies explicitly
2. **Minimal Coupling**: Avoid tight coupling between features
3. **Configuration-Driven**: Use feature flags for conditional logic
4. **Security-First**: Include security considerations in feature design

### Export Process

1. **Test Locally**: Always test exported apps locally first
2. **Version Control**: Tag exported versions for traceability
3. **Documentation**: Include setup instructions in exported apps
4. **Security Review**: Review exported dependencies and configurations

### CI/CD

1. **Automated Testing**: Include tests in the export process
2. **Security Scanning**: Regular security audits of exported apps
3. **Performance Monitoring**: Track bundle sizes and performance metrics
4. **Rollback Strategy**: Maintain previous versions for quick rollback

## Contributing

### Adding New Features

1. Define the feature in `features.yml`
2. Create the module structure in `modules/`
3. Update the export script if needed
4. Test the export process
5. Update documentation

### Modifying Export Logic

1. Review the `LyricaExporter` class
2. Add new methods for custom processing
3. Update validation logic for new features
4. Test with multiple profiles

## License

This export system is part of the Lyrica template and follows the same license terms.
