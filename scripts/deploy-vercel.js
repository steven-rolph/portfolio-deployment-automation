import { execSync } from 'child_process';
import axios from 'axios';

const args = process.argv.slice(2);
const projectName = args[args.indexOf('--project-name') + 1];
const environment = args[args.indexOf('--environment') + 1];
const githubRepo = args[args.indexOf('--github-repo') + 1];
const githubSha = args[args.indexOf('--github-sha') + 1];

console.log(`🚀 Deploying ${projectName} to Vercel with Git integration...`);

try {
  const projectData = {
    name: projectName,
    gitRepository: {
      type: 'github',
      repo: githubRepo
    }
  };

  console.log('🔗 Setting up Git repository connection...');
  
  let projectExists = false;
  
  try {
    await axios.post(
      'https://api.vercel.com/v10/projects',
      projectData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Created new project with Git integration: ${projectName}`);
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`ℹ️ Project ${projectName} already exists, updating Git connection...`);
      projectExists = true;
      
      try {
        await axios.patch(
          `https://api.vercel.com/v9/projects/${projectName}`,
          { gitRepository: projectData.gitRepository },
          {
            headers: {
              'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ Updated project with Git integration`);
      } catch (updateError) {
        console.log(`ℹ️ Could not update Git integration, proceeding with normal deployment`);
      }
    } else {
      console.log(`ℹ️ Could not set up Git integration, proceeding with normal deployment`);
      console.log(`Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  console.log('📦 Installing Vercel CLI...');
  execSync('npm install -g vercel', { stdio: 'inherit' });
  
  console.log('🚀 Deploying to Vercel...');
  const deployCommand = [
    'vercel',
    `--token ${process.env.VERCEL_TOKEN}`,
    environment === 'production' ? '--prod' : '',
    '--yes',
    `--name "${projectName}"`,
    `--meta githubCommitSha=${githubSha}`,
    `--meta githubRepo=${githubRepo}`
  ].filter(Boolean).join(' ');
  
  const deploymentUrl = execSync(deployCommand, { encoding: 'utf8' }).trim();
  
  console.log(`✅ Deployed to: ${deploymentUrl}`);
  console.log(`✅ Repository: ${githubRepo}`);
  
} catch (error) {
  console.error('❌ Vercel deployment failed:', error.message);
  process.exit(1);
}