# Deployment Guide for KNULLVOID Multigame Portal

This guide will help you deploy your multigame website to get a live, working URL.

## Important Note About Repository Size

Your repository is approximately 3.8GB in size, which exceeds GitHub's recommended repository size limit of 1GB. We'll use Git LFS (Large File Storage) to handle this properly.

## Option 1: Deploy to GitHub Pages with Git LFS (Recommended)

### Prerequisites
1. Git installed on your computer
2. GitHub account
3. Git LFS installed (comes with Git for Windows)

### Step-by-Step Instructions

#### 1. Initialize Git LFS
Open a terminal/command prompt in your project directory and run:
```bash
git lfs install
```

#### 2. Create a New Repository on GitHub
1. Go to https://github.com and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Give it a name (e.g., "multigame-portal")
5. **Important**: Leave all options unchecked (don't initialize with README, .gitignore, or license)
6. Click "Create repository"

#### 3. Push Your Repository to GitHub
In your terminal, run these commands:
```bash
# Add all files to git
git add .

# Commit the files
git commit -m "Initial commit: Multigame portal with 150+ games"

# Add the remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Rename the branch to main (if needed)
git branch -M main

# Push with Git LFS
git lfs push --all origin main

# Push the rest of the repository
git push -u origin main
```

#### 4. Enable GitHub Pages
1. Go to your repository page on GitHub
2. Click on "Settings" tab
3. Scroll down to the "Pages" section
4. In the "Source" dropdown, select "main" branch
5. Click "Save"
6. Wait a few minutes for GitHub to build your site

Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`

## Option 2: Deploy to Netlify (Alternative - Better for Large Sites)

Netlify has better support for large static websites and doesn't have the same size restrictions as GitHub Pages.

### Step-by-Step Instructions

#### 1. Sign Up for Netlify
1. Go to https://netlify.com
2. Click "Sign up" and create an account

#### 2. Deploy Your Site
1. Log in to Netlify
2. Drag and drop your entire project folder to the deployment area
3. Netlify will automatically deploy your site
4. You'll get a unique URL for your site (e.g., https://your-site-name.netlify.app)

## Option 3: Deploy to Vercel (Alternative - Good Performance)

Vercel is another excellent option for hosting static websites.

### Step-by-Step Instructions

#### 1. Sign Up for Vercel
1. Go to https://vercel.com
2. Click "Start Deploying" and create an account

#### 2. Import Your Project
1. Click "New Project"
2. Choose "Import Git Repository" or "Deploy Manually"
3. If importing from Git, connect your GitHub account and select your repository
4. If deploying manually, upload your project files
5. Configure the build settings (no build command needed for static sites)
6. Click "Deploy"

## Troubleshooting Tips

### If You Encounter Size Issues
1. Consider removing some games to reduce the repository size
2. Use external CDN services for large asset files
3. Compress image and audio files where possible

### If Git LFS Doesn't Work Properly
1. Make sure Git LFS is properly installed: `git lfs install`
2. Verify LFS is tracking the right files: `git lfs track`
3. Check which files are tracked: `git lfs ls-files`

### If Your Site Doesn't Load Properly
1. Check browser console for errors (F12 -> Console tab)
2. Ensure all game directories are properly uploaded
3. Verify that the config.js file has correct paths to games

## Performance Optimization Tips

1. Enable compression on your hosting platform
2. Use a CDN for better global performance
3. Consider lazy loading for game thumbnails
4. Minify CSS and JavaScript files

## Getting Your Live URL

After following any of the above deployment methods, you'll receive a public URL where anyone can access your multigame portal:

- GitHub Pages: `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`
- Netlify: `https://YOUR_SITE_NAME.netlify.app`
- Vercel: `https://YOUR_PROJECT_NAME.vercel.app`

Share this URL with anyone who should be able to access your multigame website!