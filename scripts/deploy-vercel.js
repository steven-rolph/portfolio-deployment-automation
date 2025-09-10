import { execSync } from 'child_process';

const args = process.argv.slice(2);
const projectName = args[args.indexOf('--project-name') + 1];
const environment = args[args.indexOf('--environment') + 1];
const githubRepo = args[args.indexOf('--github-repo') + 1];
const githubSha = args[args.indexOf('--github-sha') + 1];

console.log(`🚀 Deploying ${projectName} to Vercel...`);

try {
  execSync('npm install -g vercel', { stdio: 'inherit' });
  
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
  
} catch (error) {
  console.error('❌ Vercel deployment failed:', error.message);
  process.exit(1);
}