# Skill Versioning Plugin for Claude Code

> Automatic version control for Claude Code Skills with semantic versioning, auto-backup, and changelog generation.

## Features

- 🔄 **Auto-backup**: Automatically backs up SKILL.md on every edit
- 📋 **Semantic Versioning**: MAJOR.MINOR.PATCH format
- 📜 **Changelog**: Track changes with Keep a Changelog format
- 🎯 **Zero config**: Works out of the box with PostToolUse hook
- 📁 **Organized**: Clean releases/ folder for version history

## Quick Start

### 1. Install the plugin

```bash
# Add the marketplace
claude plugin marketplace add cathy-kim/skill-versioning-plugin

# Install the plugin
claude plugin install skill-versioning@cathy-kim/skill-versioning-plugin
```

### 2. Or test locally

```bash
# Clone this repo
git clone https://github.com/cathy-kim/skill-versioning-plugin.git

# Install dependencies
cd skill-versioning-plugin
npm install

# Test with Claude Code
claude --plugin-dir ./skill-versioning-plugin
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
skill-versioning-plugin/
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
    ├── v2.0.0_2025-12-15_SKILL.md
    └── v3.0.0_2026-01-15_SKILL.md
```

## Version Bump Guide

| Change Type | Version | Example |
|-------------|---------|---------|
| Breaking change | MAJOR | Workflow restructure |
| New feature | MINOR | Add new agent |
| Bug fix | PATCH | Fix typo |

## Migration

For existing skills without versioning:

```bash
# Run from your project root
npx tsx node_modules/skill-versioning-plugin/scripts/migrate-skill-versioning.ts

# Or if testing locally
npx tsx ./scripts/migrate-skill-versioning.ts
```

The migration script will:
- Create `releases/` folders
- Add version headers to SKILL.md files
- Generate CHANGELOG.md from git history
- Migrate existing backup files

## CLI Commands

After installing the plugin:

```bash
# View versioning guide
/skill-versioning:versioning-guide
```

## How It Works

1. **PostToolUse Hook** detects when you edit a SKILL.md file
2. **Version Extraction** reads the `**Version**: X.X.X` header
3. **Auto-backup** creates `releases/v{VERSION}_{DATE}_SKILL.md`
4. **Skip duplicates** - won't create backup if same version exists

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
