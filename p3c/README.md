# P3C Rules Plugin

Alibaba P3C Java Coding Guidelines（阿里巴巴Java开发手册）as Claude Code rules.

## What it does

Automatically installs 14 P3C rule files into your project's `.claude/rules/p3c/` directory via symlink. Claude Code loads these rules as context when editing matching files (e.g., `**/*.java`).

## Rules included

| File | Category | Source |
|------|----------|--------|
| `naming.md` | Naming Conventions | 命名风格 |
| `constants.md` | Constant Definitions | 常量定义 |
| `formatting.md` | Code Formatting | 代码格式 |
| `oop.md` | OOP Rules | OOP规约 |
| `collections.md` | Collection Handling | 集合处理 |
| `concurrency.md` | Concurrency | 并发处理 |
| `flow-control.md` | Flow Control | 控制语句 |
| `comments.md` | Code Comments | 注释规约 |
| `exceptions-logging.md` | Exception & Logging | 异常日志 |
| `misc.md` | Other Rules | 其他 |
| `testing.md` | Unit Testing | 单元测试 |
| `security.md` | Security | 信息安全 |
| `mysql.md` | MySQL Guidelines | MySQL数据库 |
| `architecture.md` | Application Architecture | 工程结构 |

## Installation

```bash
claude plugin add /path/to/apex-plugin/p3c
```

On next session start, the plugin creates a symlink:

```
.claude/rules/p3c/ -> <plugin-root>/rules/
```

## How it works

- A `SessionStart` hook runs `p3c-setup.sh`
- The hook symlinks the bundled `rules/` directory into `.claude/rules/p3c/`
- Each rule file uses `paths: ["**/*.java"]` frontmatter so rules only activate when editing Java files
- If `.claude/rules/p3c/` already exists as a regular directory (user-managed), the hook skips installation with a warning

## Uninstallation

```bash
claude plugin remove p3c
rm .claude/rules/p3c  # remove the symlink
```
