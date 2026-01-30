# Changelog - skill-versioning-plugin

All notable changes to this plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-01-30

### Added
- Pre-release version support (e.g., `1.0.0-alpha`, `1.0.0-beta.1`, `2.0.0-rc.1`)
- Build metadata support (e.g., `1.0.0+build.123`)
- Last Updated date auto-update in SKILL.md
- Initial development indicator for 0.x.x versions ("Initial Development")
- RESEARCH-SUMMARY.md with SCAR scoring methodology

### Changed
- Optimized file reading: reduced fs.readFileSync calls from 2 to 1
- Improved version extraction with comprehensive regex patterns
- Better cross-platform path handling using regex instead of path.join()

### Fixed
- Path separator compatibility issue between Windows and Mac
- Version pattern matching priority for mixed format files

---

## [1.0.1] - 2026-01-30

### Added
- CHANGELOG.md auto-generation for skills
- Keep a Changelog format support

---

## [1.0.0] - 2026-01-30

### Added
- Initial release of skill-versioning-plugin
- PostToolUse hook for automatic SKILL.md backup
- Semantic versioning support (MAJOR.MINOR.PATCH)
- releases/ folder structure for version snapshots
- Version extraction from multiple header formats:
  - `**Version**: X.X.X`
  - `Version: X.X.X`
  - `# Title vX.X.X`
- Duplicate backup prevention (same version skip)
- Migration script for existing skills
- Versioning guide skill included

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.1.0 | 2026-01-30 | Pre-release support, Last Updated auto-update, performance optimization |
| 1.0.1 | 2026-01-30 | CHANGELOG auto-generation |
| 1.0.0 | 2026-01-30 | Initial release |
