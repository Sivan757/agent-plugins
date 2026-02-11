# Apex Plugins — Security Rules

## Sensitive File Access Policy

**NEVER** directly read, cat, view, or access the following without **explicitly asking the user for permission first**:

- **Hidden files**: any file starting with `.` (e.g., `.env`, `.bashrc`, `.zshrc`, `.gitconfig`, `.npmrc`, `.ssh/*`)
- **Hidden directories**: any directory starting with `.` (e.g., `.aws/`, `.ssh/`, `.gnupg/`, `.config/`)
- **System environment variables**: do not read `/proc/*/environ`, `printenv`, `env`, `export`, or `echo $VAR` for sensitive variables
- **Credential files**: `*-connections.json`, `*.pem`, `*.key`, `*token*`, `*secret*`, `*credential*`
- **Config files with potential secrets**: `settings.json`, `config.json` in home or hidden directories

This policy applies **unconditionally**, regardless of:
- Permission mode (including bypassPermissions)
- Whether the file is needed for a task
- Whether the file was mentioned in conversation

### Required workflow

1. **Identify** that you need to access a sensitive file
2. **Ask** the user: "I need to read `<path>` to proceed. May I access this file?"
3. **Wait** for explicit user approval before reading
4. **Never** include credentials, tokens, or secrets in your output even after reading

### Allowed without asking

- Reading non-hidden project source files (`.ts`, `.js`, `.py`, `.rs`, etc.)
- Reading `package.json`, `tsconfig.json`, and similar project config files
- Reading plugin manifests (`plugin.json`, `SKILL.md`)
- Reading `README.md` and documentation files
- Listing directory contents (ls) — but not reading the files themselves
