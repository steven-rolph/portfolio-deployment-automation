import fs from 'fs';
import { execSync } from 'child_process';

async function updatePortfolio(configFile, repository, domain, portfolioRepo, githubToken, forceUpdate) {
  try {
    console.log('📝 Updating portfolio...');
    
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    
    execSync(`git clone https://${githubToken}@github.com/${portfolioRepo}.git portfolio`, { stdio: 'inherit' });
    
    process.chdir('portfolio');
    
    execSync('git config user.name "Deployment Bot"');
    execSync('git config user.email "deployment-bot@github-actions.com"');
    
    const projectData = {
      name: config.projectName,
      description: config.description,
      url: domain ? `https://${domain}` : null,
      github: repository,
      deployedAt: new Date().toISOString(),
      techStack: config.techStack || [],
      category: config.category || 'web-app',
      featured: config.featured || false
    };
    
    const projectsFile = 'public/data/projects.json';
    let projects = [];
    
    if (fs.existsSync(projectsFile)) {
      projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
    } else {
      execSync('mkdir -p public/data');
    }
    
    projects = projects.filter(p => p.name !== projectData.name);
    
    projects.push(projectData);
    
    projects.sort((a, b) => new Date(b.deployedAt) - new Date(a.deployedAt));
    
    fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
    
    execSync('git add .');
    execSync(`git commit -m "🚀 Deploy: ${config.projectName}"`);
    
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`Pushing to branch: ${currentBranch}`);
    execSync(`git push origin ${currentBranch}`);
    
    console.log('✅ Portfolio updated successfully');
    
  } catch (error) {
    console.error('❌ Portfolio update failed:', error.message);
    throw error;
  }
}

const args = process.argv.slice(2);
const configFile = args[args.indexOf('--config-file') + 1];
const repository = args[args.indexOf('--repository') + 1];
const domain = args[args.indexOf('--domain') + 1];
const portfolioRepo = args[args.indexOf('--portfolio-repo') + 1];
const githubToken = args[args.indexOf('--github-token') + 1];
const forceUpdate = args[args.indexOf('--force-update') + 1] === 'true';

updatePortfolio(configFile, repository, domain, portfolioRepo, githubToken, forceUpdate)
  .catch(error => {
    console.error('Script failed:', error.message);
    process.exit(1);
  });