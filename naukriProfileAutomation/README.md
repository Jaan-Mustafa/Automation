# Naukri Profile Automation

Automatically update your Naukri.com profile by re-uploading your resume daily. This keeps your profile marked as "recently updated," making it more visible to recruiters.

## How It Works

1. Logs into your Naukri account via API
2. Reads your resume PDF from the local filesystem
3. Uploads it to Naukri's file validation service
4. Updates your profile with the new resume

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A [Naukri.com](https://www.naukri.com/) account
- Your resume as a PDF file

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Jaan-Mustafa/Automation.git
cd Automation/naukriProfileAutomation
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your credentials:

```bash
cp ../.env.example .env
```

Edit `.env`:

```env
NAUKRI_EMAIL=your_naukri_email@example.com
NAUKRI_PASSWORD=your_naukri_password
RESUME_PATH=../data/resume/your_resume.pdf
NAUKRI_FORM_KEY=your_form_key_here
```

### 4. Get your `NAUKRI_FORM_KEY`

The form key is required for file uploads. To get it:

1. Open [Naukri.com](https://www.naukri.com/) in your browser and log in
2. Open **DevTools** (F12) > **Network** tab
3. Manually upload/update your resume on the profile page
4. Find the POST request to `filevalidation.naukri.com/file`
5. In the request payload, copy the `formKey` value

### 5. Add your resume

Place your resume PDF in the `data/resume/` directory (at the repo root):

```
Automation/
  data/
    resume/
      your_resume.pdf
  naukriProfileAutomation/
    ...
```

Update the `RESUME_PATH` in your `.env` to match.

## Usage

### Run manually

```bash
npm run start:api
```

### Automate with GitHub Actions (Self-Hosted Runner)

Since Naukri blocks requests from cloud/datacenter IPs, this workflow uses a **self-hosted runner** on your local machine.

#### Set up the self-hosted runner

1. Go to your GitHub repo: **Settings > Actions > Runners > New self-hosted runner**
2. Follow the setup instructions for your OS
3. Start the runner as a service:

```bash
cd ~/actions-runner
./svc.sh install
./svc.sh start
```

#### Add GitHub Secrets

Go to your repo: **Settings > Secrets and variables > Actions**, and add:

| Secret | Description |
|--------|-------------|
| `NAUKRI_EMAIL` | Your Naukri login email |
| `NAUKRI_PASSWORD` | Your Naukri password |
| `NAUKRI_FORM_KEY` | The form key from DevTools |

#### Workflow

The included workflow (`.github/workflows/naukriprofileupdation.yml`) runs daily at **9:00 AM IST** and can also be triggered manually from the Actions tab.

```yaml
on:
  schedule:
    - cron: "30 3 * * *" # 9:00 AM IST
  workflow_dispatch:
```

## Why Self-Hosted Runner?

Naukri.com blocks or rate-limits requests from cloud provider IPs (GitHub Actions uses Azure/AWS). Running the workflow on your local machine uses your residential IP, which Naukri allows.

## Project Structure

```
naukriProfileAutomation/
  update-resume-api.js   # Main script - API-based resume update
  package.json           # Dependencies
```

## Dependencies

- [axios](https://www.npmjs.com/package/axios) - HTTP client
- [tough-cookie](https://www.npmjs.com/package/tough-cookie) - Cookie management
- [axios-cookiejar-support](https://www.npmjs.com/package/axios-cookiejar-support) - Cookie jar for axios
- [form-data](https://www.npmjs.com/package/form-data) - Multipart form data
- [dotenv](https://www.npmjs.com/package/dotenv) - Environment variable loading

## Disclaimer

This tool is for personal use to keep your Naukri profile active. Use responsibly and in accordance with Naukri's terms of service.

## License

ISC
