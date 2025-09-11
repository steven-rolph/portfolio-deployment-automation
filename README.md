# Portfolio Deployment Management

An automated deployment system that streamlines the deployment of personal projects to Vercel while automatically updating a separate portfolio repository to showcase deployed projects.

## Overview

This system enables seamless deployment of projects from any GitHub repository to Vercel with automatic DNS configuration and portfolio updates. When you deploy a project, it:

1. **Deploys** your project to Vercel with custom domain configuration
2. **Configures DNS** automatically via Cloudflare integration  
3. **Updates** your portfolio repository with project metadata
4. **Tracks** all deployments with timestamps and project information

## Architecture

```
+------------------+    +-------------------+    +------------------+
|   Your Project   |--->|  This Automation  |--->|  Portfolio Repo  |
|   Repository     |    |     System        |    |   (Updated)      |
+------------------+    +-------------------+    +------------------+
                                 |
                                 v
                        +-------------------+
                        |  Vercel + DNS     |
                        |   (Deployed)      |
                        +-------------------+
```

## Project Structure

```
.
├── .github/workflows/
│   └── deploy-project.yml      # Main deployment workflow
├── scripts/
│   ├── update-portfolio.js     # Updates portfolio repo with project data
│   ├── configure-dns.js        # Configures Cloudflare DNS + Vercel domains
│   ├── deploy-vercel.js        # Handles Vercel deployment
│   └── utils.js                # Configuration validation utilities
├── config/
│   └── project-defaults.json   # Default project configuration
└── package.json                # Node.js dependencies
```

## How It Works

### 1. Project Configuration
Each project you want to deploy must include a `deployment-config.json` file:

```json
{
  "projectName": "my-awesome-app",
  "description": "A brief description of your project",
  "domain": "my-app.yourdomain.com",
  "techStack": ["React", "Node.js", "MongoDB"],
  "category": "web-app",
  "featured": true
}
```

### 2. Automated Deployment Process

When triggered, the system:

1. **Validates Configuration** - Checks for required `deployment-config.json`
2. **Builds Project** - Installs dependencies and runs build process
3. **Deploys to Vercel** - Creates/updates Vercel deployment
4. **Configures DNS** - Sets up custom domain via Cloudflare (if specified)
5. **Updates Portfolio** - Clones portfolio repo and adds/updates project metadata

### 3. Portfolio Integration

The system automatically updates your portfolio repository by:
- Cloning the portfolio repository
- Reading/creating `public/data/projects.json`
- Adding/updating project metadata with deployment information
- Committing and pushing changes back to the portfolio repo

## Setup Instructions

### 1. Configure Repository Secrets

In your GitHub repository settings, add these secrets:

```
VERCEL_TOKEN              # Vercel API token
CLOUDFLARE_API_TOKEN      # Cloudflare API token (for DNS)
PERSONAL_ACCESS_TOKEN     # GitHub token with repo access
PORTFOLIO_REPO            # Your portfolio repo (username/repo-name)
```

### 2. Prepare Your Projects

Add `deployment-config.json` to each project you want to deploy:

```json
{
  "projectName": "unique-project-name",
  "description": "What this project does",
  "domain": "optional-custom-domain.com",
  "techStack": ["Framework", "Language", "Database"],
  "category": "web-app|mobile-app|cli-tool|library",
  "featured": false
}
```

### 3. Deploy a Project

1. Go to the **Actions** tab in this repository
2. Select **🚀 Deploy Personal Project**
3. Click **Run workflow**
4. Fill in the parameters:
   - **Repository**: `username/project-repo`
   - **Branch**: `main` (or your target branch)
   - **Environment**: `production` or `preview`
   - **Force update portfolio**: Check if you want to update existing entries

## Scripts Reference

### `update-portfolio.js`
Updates the portfolio repository with project metadata.

**Parameters:**
- `--config-file`: Path to deployment config
- `--repository`: GitHub repository name
- `--domain`: Custom domain (optional)
- `--portfolio-repo`: Portfolio repository name
- `--github-token`: GitHub access token
- `--force-update`: Force update existing projects

### `configure-dns.js`
Configures DNS records via Cloudflare and adds domain to Vercel.

**Parameters:**
- `--project-name`: Vercel project name
- `--domain`: Custom domain to configure
- `--vercel-token`: Vercel API token
- `--cloudflare-token`: Cloudflare API token

### `deploy-vercel.js`
Handles Vercel deployment with metadata.

**Parameters:**
- `--project-name`: Project name for Vercel
- `--environment`: `production` or `preview`
- `--github-repo`: Source repository
- `--github-sha`: Git commit SHA

## Portfolio Data Structure

Projects are stored in your portfolio repository at `public/data/projects.json`:

```json
[
  {
    "name": "project-name",
    "description": "Project description",
    "url": "https://deployed-domain.com",
    "github": "username/repo-name",
    "deployedAt": "2024-01-01T12:00:00.000Z",
    "techStack": ["React", "Node.js"],
    "category": "web-app",
    "featured": true
  }
]
```

## Supported Project Types

The system supports any project that:
- Has a `package.json` with a `build` script
- Can be deployed to Vercel
- Includes the required `deployment-config.json`

Common frameworks supported:
- React/Next.js
- Vue/Nuxt.js  
- Svelte/SvelteKit
- Angular
- Static sites
- Node.js APIs

## Troubleshooting

### Common Issues

1. **Missing deployment-config.json**
   - Ensure the file exists in your project root
   - Validate JSON syntax

2. **Build failures**
   - Check that your project builds locally
   - Verify all dependencies are in `package.json`

3. **DNS configuration errors**
   - Verify Cloudflare token has zone edit permissions
   - Check domain ownership in Cloudflare

4. **Portfolio update failures**
   - Ensure `PERSONAL_ACCESS_TOKEN` has write access to portfolio repo
   - Verify portfolio repository exists and is accessible

### Debug Steps

1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are properly configured
3. Test project deployment manually to isolate issues
4. Validate configuration files with the utils script

## Security Notes

- API tokens are stored as GitHub Secrets
- All communications use HTTPS
- Portfolio updates are made by a dedicated bot account
- No secrets are logged or exposed in outputs

## Contributing

To extend the system:
1. Fork this repository
2. Add new scripts to the `scripts/` directory
3. Update the workflow file as needed
4. Test with a sample project
5. Submit a pull request

## License

This automation system is designed for personal portfolio management. Modify as needed for your specific requirements.