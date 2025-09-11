# Export Tool Directory

This directory contains the modular export system for the Lyrica Next.js template, allowing you to generate customized versions of your application with only the features you need.

## 📁 Files

- **`export-app.js`** - Main Node.js export script (ES modules compatible)
- **`features.yml`** - Feature definitions with dependencies and conflicts
- **`export-tool-package.json`** - Dependencies required for the export tool

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm add js-yaml
```

### 2. Run Export Commands
```bash
# Export minimal app (core + auth)
node export-tool/export-app.js --profile minimal --output ./my-minimal-app

# Export blog platform
node export-tool/export-app.js --profile blog --output ./my-blog-app

# Export custom features
node export-tool/export-app.js --features auth,blog --output ./my-custom-app
```

### 3. Run the Exported App
```bash
cd my-minimal-app
cp .env.example .env.local
pnpm install
pnpm dev
```

## 📖 Documentation

For detailed documentation, see:
- `ai/docs/EXPORT-SYSTEM-README.md` - Overview and quick start
- `ai/docs/MODULAR-EXPORT-DOCUMENTATION.md` - Technical details and configuration

## 🔧 Configuration

Edit `features.yml` to:
- Add new features
- Modify dependencies
- Update file lists
- Configure export profiles

## 📝 Notes

- The export tool is designed for solo development
- CI/CD integration has been removed for simplicity
- All export functionality works locally without GitHub Actions