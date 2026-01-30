#!/usr/bin/env npx tsx

/**
 * Skill Versioning Migration Script
 *
 * 모든 Skill에 버전 관리 구조를 적용합니다:
 * 1. releases/ 폴더 생성
 * 2. SKILL.md에 버전 헤더 추가 (없는 경우)
 * 3. CHANGELOG.md 생성 (Git 히스토리 기반)
 * 4. 기존 백업 파일 마이그레이션
 * 5. 현재 버전 백업 생성
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// ============================================================================
// Constants
// ============================================================================

const SKILLS_DIR = path.join(process.cwd(), ".claude", "skills");
const EXCLUDED_PATHS = ["/releases/", "/.deprecated/", "/deprecated/"];

// ============================================================================
// Types
// ============================================================================

interface GitCommit {
  hash: string;
  date: string;
  message: string;
}

interface SkillInfo {
  path: string;
  name: string;
  currentVersion: string | null;
  hasChangelog: boolean;
  hasReleases: boolean;
  backupFiles: string[];
  gitHistory: GitCommit[];
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log("🚀 Starting Skill Versioning Migration...\n");

  // Check if skills directory exists
  if (!fs.existsSync(SKILLS_DIR)) {
    console.log(`❌ Skills directory not found: ${SKILLS_DIR}`);
    console.log("   Make sure you're running this from your project root.");
    process.exit(1);
  }

  // 1. Find all SKILL.md files
  const skillFiles = findAllSkillFiles();
  console.log(`📁 Found ${skillFiles.length} skills to process\n`);

  if (skillFiles.length === 0) {
    console.log("No skills found to migrate.");
    return;
  }

  let processed = 0;
  let created = { releases: 0, changelog: 0, version: 0, backup: 0 };

  for (const skillPath of skillFiles) {
    const skillDir = path.dirname(skillPath);
    const skillName = path.basename(skillDir);

    console.log(`\n📦 Processing: ${skillName}`);

    try {
      // 2. Analyze skill
      const info = analyzeSkill(skillPath);

      // 3. Create releases/ folder
      const releasesDir = path.join(skillDir, "releases");
      if (!info.hasReleases) {
        fs.mkdirSync(releasesDir, { recursive: true });
        console.log(`  ✅ Created releases/`);
        created.releases++;
      }

      // 4. Migrate backup files
      for (const backupFile of info.backupFiles) {
        migrateBackupFile(backupFile, releasesDir);
      }

      // 5. Add version header if missing
      if (!info.currentVersion) {
        addVersionHeader(skillPath, "1.0.0");
        console.log(`  ✅ Added version header (v1.0.0)`);
        created.version++;
      } else {
        console.log(`  ℹ️  Version exists: v${info.currentVersion}`);
      }

      // 6. Create CHANGELOG.md
      if (!info.hasChangelog) {
        const changelog = generateChangelog(skillName, info.gitHistory, info.currentVersion || "1.0.0");
        const changelogPath = path.join(skillDir, "CHANGELOG.md");
        fs.writeFileSync(changelogPath, changelog, "utf-8");
        console.log(`  ✅ Created CHANGELOG.md`);
        created.changelog++;
      }

      // 7. Create initial backup in releases/
      const version = info.currentVersion || "1.0.0";
      const today = new Date().toISOString().split("T")[0];
      const backupFilename = `v${version}_${today}_SKILL.md`;
      const backupPath = path.join(releasesDir, backupFilename);

      if (!fs.existsSync(backupPath)) {
        const content = fs.readFileSync(skillPath, "utf-8");
        fs.writeFileSync(backupPath, content, "utf-8");
        console.log(`  ✅ Created backup: ${backupFilename}`);
        created.backup++;
      }

      processed++;
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Migration Summary");
  console.log("=".repeat(60));
  console.log(`Total skills processed: ${processed}/${skillFiles.length}`);
  console.log(`releases/ folders created: ${created.releases}`);
  console.log(`CHANGELOG.md files created: ${created.changelog}`);
  console.log(`Version headers added: ${created.version}`);
  console.log(`Backup files created: ${created.backup}`);
  console.log("=".repeat(60));
}

// ============================================================================
// Helper Functions
// ============================================================================

function findAllSkillFiles(): string[] {
  const results: string[] = [];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;

    let files: string[];
    try {
      files = fs.readdirSync(dir);
    } catch {
      return;
    }

    for (const file of files) {
      const filePath = path.join(dir, file);

      let stat;
      try {
        stat = fs.statSync(filePath);
      } catch {
        // Skip broken symlinks or inaccessible files
        continue;
      }

      if (stat.isDirectory()) {
        // Skip excluded paths
        if (EXCLUDED_PATHS.some((ex) => filePath.includes(ex))) continue;
        walk(filePath);
      } else if (file === "SKILL.md") {
        // Skip files in excluded paths
        if (EXCLUDED_PATHS.some((ex) => filePath.includes(ex))) continue;
        results.push(filePath);
      }
    }
  }

  walk(SKILLS_DIR);
  return results;
}

function analyzeSkill(skillPath: string): SkillInfo {
  const skillDir = path.dirname(skillPath);
  const skillName = path.basename(skillDir);

  // Check current version
  const content = fs.readFileSync(skillPath, "utf-8");
  const currentVersion = extractVersion(content);

  // Check for CHANGELOG.md
  const hasChangelog = fs.existsSync(path.join(skillDir, "CHANGELOG.md"));

  // Check for releases/
  const hasReleases = fs.existsSync(path.join(skillDir, "releases"));

  // Find backup files
  const backupFiles = findBackupFiles(skillDir);

  // Get git history
  const gitHistory = getGitHistory(skillPath);

  return {
    path: skillPath,
    name: skillName,
    currentVersion,
    hasChangelog,
    hasReleases,
    backupFiles,
    gitHistory,
  };
}

function extractVersion(content: string): string | null {
  const patterns = [
    /\*\*Version\*\*:\s*(\d+\.\d+\.\d+)/i,
    /Version:\s*(\d+\.\d+\.\d+)/i,
    /^#.*v(\d+\.\d+\.\d+)/im,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function findBackupFiles(skillDir: string): string[] {
  const backups: string[] = [];

  if (!fs.existsSync(skillDir)) return backups;

  const files = fs.readdirSync(skillDir);
  for (const file of files) {
    if (file.includes(".backup") || file === "SKILL.md.new") {
      backups.push(path.join(skillDir, file));
    }
  }

  // Also check deprecated/ folder
  const deprecatedDir = path.join(skillDir, "deprecated");
  if (fs.existsSync(deprecatedDir)) {
    const deprecatedFiles = fs.readdirSync(deprecatedDir);
    for (const file of deprecatedFiles) {
      if (file.includes(".backup")) {
        backups.push(path.join(deprecatedDir, file));
      }
    }
  }

  return backups;
}

function getGitHistory(filePath: string): GitCommit[] {
  try {
    const output = execSync(
      `git log --format="%H|%ad|%s" --date=short -- "${filePath}" 2>/dev/null | head -20`,
      { encoding: "utf-8", cwd: process.cwd() }
    );

    return output
      .trim()
      .split("\n")
      .filter((line) => line.length > 0)
      .map((line) => {
        const [hash, date, ...messageParts] = line.split("|");
        return {
          hash: hash?.substring(0, 8) || "",
          date: date || "",
          message: messageParts.join("|") || "",
        };
      });
  } catch {
    return [];
  }
}

function addVersionHeader(skillPath: string, version: string): void {
  let content = fs.readFileSync(skillPath, "utf-8");
  const today = new Date().toISOString().split("T")[0];

  // Find the first # header
  const headerMatch = content.match(/^(---[\s\S]*?---\n+)?# .+$/m);

  if (headerMatch) {
    const insertIndex = (headerMatch.index || 0) + headerMatch[0].length;
    const before = content.substring(0, insertIndex);
    const after = content.substring(insertIndex);

    // Check if version already exists right after header
    if (!after.trim().startsWith("**Version**")) {
      content = before + `\n\n**Version**: ${version}\n**Last Updated**: ${today}` + after;
      fs.writeFileSync(skillPath, content, "utf-8");
    }
  }
}

function migrateBackupFile(backupPath: string, releasesDir: string): void {
  const filename = path.basename(backupPath);

  // Extract date from filename if present
  const dateMatch = filename.match(/(\d{8})/);
  let date = new Date().toISOString().split("T")[0];
  let version = "1.0.0";

  if (dateMatch) {
    const dateStr = dateMatch[1];
    date = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }

  // Generate new filename
  const newFilename = `v${version}_${date}_SKILL.md`;
  const newPath = path.join(releasesDir, newFilename);

  // Check if already exists (avoid overwriting)
  if (!fs.existsSync(newPath)) {
    fs.renameSync(backupPath, newPath);
    console.log(`  📦 Migrated: ${filename} → ${newFilename}`);
  } else {
    // Try with a suffix
    const altFilename = `v${version}_${date}_SKILL-backup.md`;
    const altPath = path.join(releasesDir, altFilename);
    if (!fs.existsSync(altPath)) {
      fs.renameSync(backupPath, altPath);
      console.log(`  📦 Migrated: ${filename} → ${altFilename}`);
    }
  }
}

function generateChangelog(
  skillName: string,
  gitHistory: GitCommit[],
  currentVersion: string
): string {
  const today = new Date().toISOString().split("T")[0];

  let changelog = `# Changelog - ${skillName}

All notable changes to this skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [${currentVersion}] - ${today}

### Added
- Initial versioning setup
- releases/ folder for version snapshots
- CHANGELOG.md for change tracking

`;

  // Add git history as reference
  if (gitHistory.length > 0) {
    changelog += `---

## Git History Reference

| Date | Commit | Message |
|------|--------|---------|
`;
    for (const commit of gitHistory.slice(0, 15)) {
      const safeMessage = commit.message.replace(/\|/g, "\\|").substring(0, 60);
      changelog += `| ${commit.date} | ${commit.hash} | ${safeMessage} |\n`;
    }
  }

  return changelog;
}

// ============================================================================
// Entry Point
// ============================================================================

main().catch(console.error);
