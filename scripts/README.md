# Scripts Directory

This directory contains utility scripts for the AI Free Pool project.

## Available Scripts

### generate-encryption-key.js

Generates a secure 64-character hexadecimal encryption key for API encryption.

**Usage:**
```bash
node scripts/generate-encryption-key.js
```

**Output:**
```
Generated Encryption Key:
  a1b2c3d4e5f6...

Add this to your environment variables:
  ENCRYPTION_KEY=a1b2c3d4e5f6...
```

**Important:**
- Use different keys for development and production
- Never commit keys to version control
- Store securely in environment variables
- Keep a backup in a secure password manager

## Adding New Scripts

When adding new scripts to this directory:

1. Use descriptive names (e.g., `migrate-data.js`, `seed-database.js`)
2. Add a shebang line: `#!/usr/bin/env node`
3. Make the script executable: `chmod +x scripts/your-script.js`
4. Document the script in this README
5. Add usage examples
6. Include error handling
7. Add helpful output messages

## Script Guidelines

- Use Node.js built-in modules when possible
- Add clear error messages
- Include usage instructions in comments
- Handle edge cases gracefully
- Exit with appropriate exit codes (0 for success, 1 for error)
- Log progress for long-running scripts
- Add confirmation prompts for destructive operations
