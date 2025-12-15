# KNULLVOID Multigame Portal

A comprehensive multigame portal featuring 150+ unblocked games.

## Features
- Over 150 games including popular titles like Run 3, Slope, 2048, Cookie Clicker, and many more
- Responsive design with cyber-themed UI
- Game search and sorting capabilities
- Customizable settings and themes
- Keyboard shortcuts support
- Star/favorite games functionality

## Deployment Instructions

### Option 1: GitHub Pages with Git LFS (Recommended for this large repository)

1. Install Git LFS:
   ```
   git lfs install
   ```

2. Clone this repository:
   ```
   git clone <repository-url>
   cd monkeygg2.github.io-main
   ```

3. Set up Git LFS for large files:
   ```
   git lfs track "*.mp3" "*.mp4" "*.webm" "*.wav" "*.data" "*.unityweb"
   ```

4. Create a new repository on GitHub

5. Push to GitHub:
   ```
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git branch -M main
   git push -u origin main
   ```

6. Enable GitHub Pages in your repository settings

### Option 2: Netlify (Alternative hosting with free tier)

1. Sign up at [Netlify](https://netlify.com)
2. Drag and drop the entire project folder to deploy
3. Netlify will automatically deploy your site and provide a public URL

## Technical Details

The portal uses a main index.html file that loads games through iframes. Each game is contained in its own directory under the "games" folder.

## Customization

You can customize the appearance through the Settings panel:
- Background color
- Block color
- Button color
- Games section color
- Hover effects
- Scrollbar colors
- Font colors

## Keyboard Shortcuts

- ESC: Close current game and return to main menu
- Konami Code (↑↑↓↓←→←→BA): Welcome message
- "LET IT SNOW": Snow effect easter egg

## Contributing

Feel free to fork this repository and add more games or features!

## License

This project is licensed under the WTFPL License.