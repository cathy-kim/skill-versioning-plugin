# Skill SemVer

> Automatic version control for Claude Code Skills with semantic versioning, auto-backup, and changelog generation.

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/cathy-kim/skill-semver/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Features

- 🔄 **Auto-backup**: Automatically backs up SKILL.md on every edit
- 📋 **Semantic Versioning**: MAJOR.MINOR.PATCH format with pre-release support
- 📜 **Changelog**: Track changes with Keep a Changelog format
- 🎯 **Zero config**: Works out of the box with PostToolUse hook
- 📁 **Organized**: Clean releases/ folder for version history
- 📅 **Auto-update**: Automatically updates "Last Updated" date
- 🏷️ **Pre-release**: Support for alpha, beta, rc versions (e.g., `1.0.0-alpha`, `2.0.0-beta.1`)

## Quick Start

### 1. Install the plugin

```bash
# Using Claude Code CLI
claude mcp add-json skill-semver '{"type":"stdio","command":"npx","args":["-y","skill-semver"]}'
```

### 2. Or clone locally

```bash
# Clone this repo
git clone https://github.com/cathy-kim/skill-semver.git

# Install dependencies
cd skill-semver
npm install
```

### 3. Add version header to your SKILL.md

```markdown
# My Skill

> Description of the skill

**Version**: 1.0.0
**Last Updated**: 2026-01-30
```

### 4. Edit and save - backup is automatic!

The hook will create `releases/v1.0.0_2026-01-30_SKILL.md` automatically.

## Plugin Structure

```
skill-semver/
├── .claude-plugin/
│   └── plugin.json           # Plugin metadata
├── skills/
│   └── versioning-guide/
│       └── SKILL.md          # Versioning guide skill
├── hooks/
│   ├── hooks.json            # Hook configuration
│   └── skill-version-hook.ts # Auto-backup hook
├── scripts/
│   └── migrate-skill-versioning.ts  # Migration script
├── examples/
│   └── example-skill/        # Example skill structure
├── package.json
├── CHANGELOG.md
├── RESEARCH-SUMMARY.md
└── README.md
```

## Skill Folder Structure

After using this plugin, your skills will have this structure:

```
.claude/skills/your-skill/
├── SKILL.md          # Current version
├── CHANGELOG.md      # Change history
└── releases/         # Version snapshots
    ├── v1.0.0_2025-12-01_SKILL.md
    ├── v2.0.0-beta.1_2025-12-15_SKILL.md
    └── v3.0.0_2026-01-15_SKILL.md
```

## Version Formats

### Supported Versions

| Format | Example | Description |
|--------|---------|-------------|
| Standard | `1.2.3` | MAJOR.MINOR.PATCH |
| Pre-release | `1.0.0-alpha` | Alpha version |
| Pre-release with number | `2.0.0-beta.1` | Beta version 1 |
| Release candidate | `3.0.0-rc.1` | Release candidate |
| Build metadata | `1.0.0+build.123` | With build info |

### Version Bump Guide

| Change Type | Version | Example |
|-------------|---------|---------|
| Breaking change | MAJOR | Workflow restructure |
| New feature | MINOR | Add new agent |
| Bug fix | PATCH | Fix typo |

### Initial Development (0.x.x)

Versions starting with `0.` are marked as "Initial Development" and indicate the skill is not yet stable.

## How It Works

1. **PostToolUse Hook** detects when you edit a SKILL.md file
2. **Version Extraction** reads the `**Version**: X.X.X` header
3. **Last Updated** automatically updates the date
4. **Auto-backup** creates `releases/v{VERSION}_{DATE}_SKILL.md`
5. **CHANGELOG** updates with new version entry
6. **Skip duplicates** - won't create backup if same version exists

## Version Header Formats

The hook recognizes these version patterns:

```markdown
**Version**: 1.0.0           ✓ Preferred
**Version**: 1.0.0-alpha     ✓ Pre-release
Version: 1.0.0               ✓ Alternative
# My Skill v1.0.0            ✓ In title
```

## Migration

For existing skills without versioning:

```bash
# Run from your project root
npx tsx scripts/migrate-skill-versioning.ts
```

The migration script will:
- Create `releases/` folders
- Add version headers to SKILL.md files
- Generate CHANGELOG.md from git history
- Migrate existing backup files

## CHANGELOG Format

```markdown
# Changelog - my-skill

## [1.1.0] - 2026-01-30

### Added
- New feature description

### Changed
- Updated behavior

### Fixed
- Bug fix description
```

## What's New in v1.1.0

- **Pre-release Support**: Handle alpha, beta, rc versions
- **Build Metadata**: Support `+build.123` suffixes
- **Auto Last Updated**: Automatically update the date field
- **Performance**: Reduced file reads from 2 to 1
- **Cross-platform**: Fixed path separator issues (Windows/Mac)

## Requirements

- Claude Code CLI v1.0.33+
- Node.js 18+
- TypeScript (tsx)

## License

MIT

## Author

[cathy-kim](https://github.com/cathy-kim)

---

Made with ❤️ for the Claude Code community
