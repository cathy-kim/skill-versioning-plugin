# Skill Versioning Guide

> 스킬 버전 관리를 위한 가이드 및 자동화 지원

**Version**: 1.0.0
**Last Updated**: 2026-01-30

---

## Purpose

이 스킬은 Claude Code Skills의 버전 관리 방법을 안내하고 자동화를 지원합니다.

---

## 버전 관리 원칙

### Semantic Versioning

```
MAJOR.MINOR.PATCH

예: 3.1.0
- MAJOR: 호환성 깨지는 대규모 변경 (Breaking Changes)
- MINOR: 새로운 기능 추가 (Features)
- PATCH: 버그 수정, 문서 개선 (Fixes)
```

### 버전 증가 기준

| 변경 유형 | 버전 증가 | 예시 |
|----------|----------|------|
| 핵심 로직 변경 | MAJOR | Workflow 구조 변경 |
| Phase 추가/제거 | MAJOR | Phase 4.5 추가 |
| 새 기능 추가 | MINOR | Context Injection 도입 |
| Agent/Hook 추가 | MINOR | 새 Agent 정의 추가 |
| 버그 수정 | PATCH | 오타 수정, 설명 보완 |
| 문서 개선 | PATCH | 예시 추가, 가독성 개선 |

---

## Skill 폴더 구조

각 Skill은 다음 구조를 따릅니다:

```
.claude/skills/[skill-name]/
├── SKILL.md              # 현재 버전 (최신)
├── CHANGELOG.md          # 변경 히스토리
├── releases/             # 버전별 스냅샷
│   ├── v1.0.0_2025-12-01_SKILL.md
│   ├── v2.0.0_2025-12-15_SKILL.md
│   └── v3.1.0_2026-01-21_SKILL.md
├── references/           # 참조 문서 (선택)
├── agents/               # Agent 정의 (선택)
└── templates/            # 템플릿 (선택)
```

---

## SKILL.md 버전 헤더 형식

SKILL.md 상단에 다음 형식 필수:

```markdown
# [Skill Name]

> [Skill 설명]

**Version**: 3.2.0
**Last Updated**: 2026-01-22
```

---

## CHANGELOG.md 형식

```markdown
# Changelog - [Skill Name]

All notable changes to this skill will be documented in this file.

## [3.1.0] - 2026-01-21

### Added
- Context Injection System 추가

### Changed
- Quality Score 배점 조정

### Fixed
- Goal Retention 문제 해결
```

### 변경 유형 분류

- **Added**: 새로운 기능 추가
- **Changed**: 기존 기능 변경
- **Deprecated**: 곧 제거될 기능
- **Removed**: 제거된 기능
- **Fixed**: 버그 수정
- **Security**: 보안 관련 변경

---

## 자동화 (PostToolUse Hook)

이 플러그인은 SKILL.md 파일 수정 시 자동으로 백업을 생성합니다:

1. Write/Edit 도구로 SKILL.md 수정 감지
2. 버전 헤더에서 버전 번호 추출
3. `releases/v{VERSION}_{DATE}_SKILL.md` 백업 생성
4. 동일 버전 백업이 있으면 스킵

---

## 수동 버전 릴리스 절차

```bash
# 1. SKILL.md 상단 버전 업데이트
# **Version**: 3.2.0

# 2. CHANGELOG.md에 변경 사항 기록
## [3.2.0] - 2026-01-22
### Added
- 새 기능 설명

# 3. Git 커밋
git add SKILL.md CHANGELOG.md releases/
git commit -m "feat([skill-name]): Release v3.2.0 - 새 기능 설명"
```

---

## 마이그레이션

기존 Skills에 버전 관리를 적용하려면:

```bash
npx tsx scripts/migrate-skill-versioning.ts
```

이 스크립트는:
- releases/ 폴더 생성
- SKILL.md에 버전 헤더 추가
- Git 히스토리 기반 CHANGELOG.md 생성
- 기존 백업 파일 마이그레이션
