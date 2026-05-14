import os
import subprocess
import webbrowser
import time
import sys

def main():
    base_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    # If running as executable, the powershell script might be outside the temp MEIPASS.
    # Assuming the executable is placed in the root directory:
    if getattr(sys, 'frozen', False):
        base_dir = os.path.dirname(sys.executable)
        
    ps1_path = os.path.join(base_dir, "run_all.ps1")
    
    if not os.path.exists(ps1_path):
        print(f"Error: Could not find {ps1_path}")
        print("Please place this executable in the project root directory.")
        time.sleep(5)
        return

    print("Initializing AlphaMind Trading Engine... Please wait.")
    
    # Start the backend and frontend silently
    subprocess.Popen(["powershell.exe", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-File", ps1_path], 
                     creationflags=subprocess.CREATE_NO_WINDOW)
    
    print("Waiting for backend and frontend servers to come online...")
    # Give it a few seconds to start up
    time.sleep(12) 
    
    print("Opening Application Interface...")
    url = "http://localhost:3000"
    
    # Try to open in Chrome App Mode for a native desktop application feel
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    edge_path = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
    
    if os.path.exists(chrome_path):
        subprocess.Popen([chrome_path, f"--app={url}"])
    elif os.path.exists(edge_path):
        subprocess.Popen([edge_path, f"--app={url}"])
    else:
        webbrowser.open(url)
        
if __name__ == "__main__":
    main()
