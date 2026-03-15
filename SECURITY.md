# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **kogunlowo@gmail.com**

Include the following in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive an acknowledgment within 48 hours and a detailed response within 7 days.

## Security Best Practices

This project follows these security practices:

- Dependencies are regularly reviewed and updated
- Secrets and credentials are never committed to the repository
- Input validation and sanitization are applied where applicable
- CI/CD credentials are managed via environment variables and secret stores
- MCP server communications use authenticated and encrypted channels
- Pipeline operations follow least-privilege principles
- npm audit is run regularly to check for known vulnerabilities

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Disclosure Policy

We follow a coordinated disclosure process. Please allow us reasonable time to address any reported vulnerabilities before public disclosure.
