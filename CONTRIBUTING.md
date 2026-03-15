# Contributing to MCP Server DevOps

Thank you for your interest in contributing! This guide will help you get started.

## How to Contribute

1. **Fork** the repository
2. **Create a branch** for your feature or fix (`git checkout -b feature/my-feature`)
3. **Make your changes** and ensure they follow the project conventions
4. **Test** your changes thoroughly
5. **Commit** with a clear, descriptive message
6. **Push** to your fork and open a **Pull Request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/<your-username>/mcp-server-devops.git
cd mcp-server-devops

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## Code Standards

- **Linting**: Use [ESLint](https://eslint.org/) for linting
- **Formatting**: Use [Prettier](https://prettier.io/) for code formatting
- **Testing**: Write tests and ensure all tests pass with `npm test`

```bash
# Lint code
npx eslint .

# Format code
npx prettier --write .

# Run tests
npm test
```

## Pull Request Guidelines

- Keep PRs focused on a single change
- Update documentation if needed
- Add tests for new functionality
- Ensure all existing tests pass
- Describe what your PR does and why

## Reporting Issues

- Use GitHub Issues to report bugs or request features
- Include steps to reproduce any bugs
- For security vulnerabilities, see [SECURITY.md](SECURITY.md)

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.
