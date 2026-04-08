# Automation

A collection of automation scripts to simplify repetitive tasks. Each automation lives in its own directory with independent setup and documentation.

## Automations

| Automation | Description | Docs |
|-----------|-------------|------|
| [Naukri Profile Update](./naukriProfileAutomation/) | Automatically re-uploads your resume to Naukri.com daily to keep your profile visible to recruiters | [README](./naukriProfileAutomation/README.md) |

## Repository Structure

```
Automation/
  .github/workflows/       # GitHub Actions workflows
  data/                    # Shared data files (resumes, configs, etc.)
  naukriProfileAutomation/ # Naukri resume update automation
  .env.example             # Example environment variables
  .gitignore
```

## Getting Started

1. Clone the repo:

```bash
git clone https://github.com/Jaan-Mustafa/Automation.git
cd Automation
```

2. Pick an automation from the table above and follow its README for setup instructions.

## Contributing

Contributions are welcome! Whether it's a bug fix, improvement to an existing automation, or an entirely new one.

### Adding a New Automation

1. **Fork** the repository and create a new branch:

```bash
git checkout -b feature/your-automation-name
```

2. **Create a new directory** at the root level with a descriptive name:

```
Automation/
  yourAutomationName/
    README.md        # Setup and usage docs (required)
    package.json     # Or equivalent for your language
    ...
```

3. **Include a README.md** in your automation directory with:
   - What it does
   - Prerequisites
   - Setup instructions
   - Usage guide

4. **Add a GitHub Actions workflow** in `.github/workflows/` if your automation needs scheduled runs.

5. **Update the root README** — add your automation to the table in the [Automations](#automations) section.

6. **Open a Pull Request** with a clear description of what your automation does and why it's useful.

### General Guidelines

- Keep each automation self-contained in its own directory
- Never commit secrets or credentials — use environment variables and `.env` files
- Add your `.env` keys to `.env.example` with placeholder values
- Include `node_modules/`, `.env`, and other generated files in `.gitignore`
- Write clear documentation so others can set it up easily

### Reporting Issues

Found a bug or have a suggestion? [Open an issue](https://github.com/Jaan-Mustafa/Automation/issues) with:

- Which automation is affected
- Steps to reproduce (for bugs)
- Expected vs actual behavior

## License

ISC
