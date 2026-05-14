import os
import sys
import shutil
import subprocess
import time

def install_dependencies():
    print("Checking for required system dependencies...")
    
    has_python = subprocess.call("python --version", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0
    if not has_python:
        print("-> Python is missing. Installing Python via winget (Windows Package Manager)...")
        subprocess.call("winget install -e --id Python.Python.3.11 --accept-package-agreements --accept-source-agreements", shell=True)
    else:
        print("-> Python is installed.")
        
    has_node = subprocess.call("npm --version", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0
    if not has_node:
        print("-> Node.js is missing. Installing Node.js via winget...")
        subprocess.call("winget install -e --id OpenJS.NodeJS --accept-package-agreements --accept-source-agreements", shell=True)
    else:
        print("-> Node.js is installed.")

def main():
    print("==========================================")
    print("       AlphaMind Platform Installer       ")
    print("==========================================")
    print("\nThis will install the AlphaMind AI Trading Engine on your system.")
    
    # 1. Install prerequisites if missing
    install_dependencies()
    
    # 2. Copy files to AppData
    appdata = os.getenv('LOCALAPPDATA')
    install_dir = os.path.join(appdata, "AlphaMind")
    
    if getattr(sys, 'frozen', False):
        base_dir = sys._MEIPASS
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
    print(f"\nInstalling AlphaMind to {install_dir}...")
    
    if os.path.exists(install_dir):
        print("Found existing installation. Overwriting...")
        shutil.rmtree(install_dir, ignore_errors=True)
        
    os.makedirs(install_dir, exist_ok=True)
    
    # Copy backend and frontend
    print("Unpacking application files...")
    for target in ['backend', 'frontend', 'run_all.ps1', 'desktop_launcher.py']:
        src = os.path.join(base_dir, target)
        dst = os.path.join(install_dir, target)
        if os.path.exists(src):
            if os.path.isdir(src):
                shutil.copytree(src, dst, ignore=shutil.ignore_patterns('.venv', 'node_modules', '__pycache__', '.next', '.git'))
            else:
                shutil.copy2(src, dst)
                
    # 3. Create Desktop Shortcut
    print("Creating Desktop Shortcut...")
    desktop = os.path.join(os.path.expanduser("~"), "Desktop")
    
    bat_path = os.path.join(desktop, "AlphaMind Platform.bat")
    with open(bat_path, "w") as f:
        f.write("@echo off\n")
        f.write("echo Starting AlphaMind Platform...\n")
        f.write(f'cd /d "{install_dir}"\n')
        f.write("python desktop_launcher.py\n")
        
    print("\n==========================================")
    print("Installation Complete!")
    print("==========================================")
    print("A shortcut named 'AlphaMind Platform' has been placed on your Desktop.")
    print("Double-click it to start the application.")
    print("\nNote: The first time you launch it, it will automatically download")
    print("all necessary AI models and packages (this may take a few minutes).")
    print("==========================================\n")
    
    # Pause for user to read
    time.sleep(5)

if __name__ == "__main__":
    main()
