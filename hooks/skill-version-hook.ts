#!/usr/bin/env npx tsx

/**
 * Skill Version Hook
 *
 * SKILL.md 파일이 수정될 때 자동으로 버전 백업을 생성합니다.
 *
 * Hook Event: PostToolUse (Write, Edit tools)
 *
 * 동작:
 * 1. Write/Edit 도구가 SKILL.md를 수정했는지 확인
 * 2. SKILL.md에서 버전 정보 추출
 * 3. releases/ 폴더에 버전별 백업 생성
 * 4. 로그 출력
 *
 * 파일 명명 규칙: v{VERSION}_{YYYY-MM-DD}_SKILL.md
 */

import * as fs from "fs";
import * as path from "path";

// ============================================================================
// Types
// ============================================================================

interface PostToolUseInput {
  session_id: string;
  tool_name: string;
  tool_input: {
    file_path?: string;
    content?: string;
    old_string?: string;
    new_string?: string;
  };
  tool_output?: {
    success?: boolean;
    error?: string;
  };
  transcript_path?: string;
}

interface HookResult {
  continue: boolean;
  message?: string;
}

// ============================================================================
// Constants
// ============================================================================

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const LOG_DIR = path.join(PROJECT_DIR, ".claude", "hooks", "logs");

// ============================================================================
// Main Hook
// ============================================================================

async function main(): Promise<void> {
  try {
    // Read input from stdin
    const inputData = fs.readFileSync(0, "utf-8");
    const input: PostToolUseInput = JSON.parse(inputData);

    const result = await processHook(input);

    // Output result
    console.log(JSON.stringify(result));
  } catch (error: any) {
    // Graceful degradation - don't block the session
    console.log(
      JSON.stringify({
        continue: true,
        message: `[skill-version-hook] Error: ${error.message}`,
      })
    );
  }
}

async function processHook(input: PostToolUseInput): Promise<HookResult> {
  const { tool_name, tool_input, tool_output } = input;

  // 1. Check if this is a Write or Edit tool
  if (tool_name !== "Write" && tool_name !== "Edit") {
    return { continue: true };
  }

  // 2. Check if the tool succeeded
  if (tool_output?.success === false) {
    return { continue: true };
  }

  // 3. Check if the file is a SKILL.md
  const filePath = tool_input?.file_path;
  if (!filePath || !isSkillMdFile(filePath)) {
    return { continue: true };
  }

  // 4. Extract skill name from path
  const skillName = extractSkillName(filePath);
  if (!skillName) {
    return { continue: true };
  }

  // 5. Read the SKILL.md and extract version
  const version = extractVersion(filePath);
  if (!version) {
    log(`[skill-version-hook] No version found in ${filePath}, skipping backup`);
    return {
      continue: true,
      message: `[skill-version-hook] No version header found in ${skillName}/SKILL.md`,
    };
  }

  // 6. Create releases directory if needed
  const releasesDir = path.join(path.dirname(filePath), "releases");
  if (!fs.existsSync(releasesDir)) {
    fs.mkdirSync(releasesDir, { recursive: true });
  }

  // 7. Generate backup filename
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const backupFilename = `v${version}_${today}_SKILL.md`;
  const backupPath = path.join(releasesDir, backupFilename);

  // 8. Check if backup already exists for this version
  if (fs.existsSync(backupPath)) {
    log(`[skill-version-hook] Backup already exists: ${backupFilename}`);
    return {
      continue: true,
      message: `[skill-version-hook] Backup already exists for ${skillName} v${version}`,
    };
  }

  // 9. Create backup
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    fs.writeFileSync(backupPath, content, "utf-8");

    log(`[skill-version-hook] Created backup: ${backupFilename}`);

    return {
      continue: true,
      message: `[skill-version-hook] Backed up ${skillName}/SKILL.md to releases/${backupFilename}`,
    };
  } catch (error: any) {
    log(`[skill-version-hook] Failed to create backup: ${error.message}`);
    return {
      continue: true,
      message: `[skill-version-hook] Failed to backup: ${error.message}`,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if the file path is a SKILL.md file
 */
function isSkillMdFile(filePath: string): boolean {
  // Normalize path
  const normalizedPath = path.normalize(filePath);

  // Check if it ends with SKILL.md
  if (!normalizedPath.endsWith("SKILL.md")) {
    return false;
  }

  // Check if it's in the skills directory (supports both .claude/skills and plugin skills/)
  const isInClaudeSkills = normalizedPath.includes(path.join(".claude", "skills"));
  const isInPluginSkills = normalizedPath.includes(path.join("skills", ""));

  if (!isInClaudeSkills && !isInPluginSkills) {
    return false;
  }

  // Exclude files in releases/ directory
  if (normalizedPath.includes(path.join("releases", ""))) {
    return false;
  }

  return true;
}

/**
 * Extract skill name from file path
 * e.g., /path/.claude/skills/autonomous-feature-builder/SKILL.md -> autonomous-feature-builder
 * e.g., /path/skills/my-skill/SKILL.md -> my-skill
 */
function extractSkillName(filePath: string): string | null {
  const normalizedPath = path.normalize(filePath);

  // Try .claude/skills pattern first
  let match = normalizedPath.match(/\.claude[\/\\]skills[\/\\]([^\/\\]+)[\/\\]SKILL\.md$/);
  if (match) return match[1];

  // Try plugin skills/ pattern
  match = normalizedPath.match(/skills[\/\\]([^\/\\]+)[\/\\]SKILL\.md$/);
  return match ? match[1] : null;
}

/**
 * Extract version from SKILL.md content
 * Looks for patterns like:
 * - **Version**: 3.1.0
 * - Version: 3.1.0
 * - # Skill Name v3.1.0
 */
function extractVersion(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    // Try different version patterns
    const patterns = [
      /\*\*Version\*\*:\s*(\d+\.\d+\.\d+)/i,
      /Version:\s*(\d+\.\d+\.\d+)/i,
      /^#.*v(\d+\.\d+\.\d+)/im,
      /version[:\s]+(\d+\.\d+\.\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Write log to file
 */
function log(message: string): void {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    const logFile = path.join(LOG_DIR, "skill-version-hook.log");
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(logFile, logEntry);
  } catch {
    // Ignore logging errors
  }
}

// ============================================================================
// Entry Point
// ============================================================================

main();
