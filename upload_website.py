import os
import webbrowser
import time

def main():
    print("=" * 50)
    print("KNULLVOID MULTIGAME WEBSITE DEPLOYMENT")
    print("=" * 50)
    print()
    print("Your website is READY to be deployed!")
    print("Size: Approximately 3.8GB with 150+ games")
    print()
    
    print("OPTIONS TO DEPLOY YOUR WEBSITE:")
    print("=" * 40)
    print()
    
    print("OPTION 1: Cloudflare Pages (RECOMMENDED)")
    print("-" * 30)
    print("1. Go to: https://pages.cloudflare.com")
    print("2. Sign up for FREE account")
    print("3. Create a project")
    print("4. Upload assets")
    print("5. Drag and drop this folder:")
    print("   C:\\Users\\KRISHNA\\Downloads\\monkeygg2.github.io-main\\monkeygg2.github.io-main")
    print("6. Wait 10-15 minutes")
    print("7. Get your PUBLIC URL!")
    print()
    
    print("OPTION 2: Netlify (ALTERNATIVE)")
    print("-" * 25)
    print("1. Go to: https://netlify.com")
    print("2. Sign up for FREE account")
    print("3. Drag and drop the same folder")
    print("4. Wait for deployment")
    print("5. Get your PUBLIC URL!")
    print()
    
    print("YOUR WEBSITE FEATURES:")
    print("-" * 20)
    print("• 150+ games")
    print("• Customizable themes")
    print("• Search functionality")
    print("• Settings panel")
    print()
    
    # Open browser to Cloudflare Pages
    choice = input("Press ENTER to open Cloudflare Pages in your browser, or type 'netlify' to open Netlify: ").strip().lower()
    
    if choice == 'netlify':
        webbrowser.open("https://netlify.com")
        print("Opening Netlify...")
    else:
        webbrowser.open("https://pages.cloudflare.com")
        print("Opening Cloudflare Pages...")
    
    print()
    print("SUCCESS: Your website will be live with a PUBLIC URL once uploaded!")
    print("Share this URL with anyone who should access your multigame website.")
    input("Press ENTER to exit...")

if __name__ == "__main__":
    main()