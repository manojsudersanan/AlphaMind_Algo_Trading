 import PyInstaller.__main__
import os

# Define build configuration
wrapper_script = """
import os
import sys
import streamlit.web.cli as stcli

def resolve_path(path):
    if getattr(sys, "frozen", False):
        basedir = sys._MEIPASS
    else:
        basedir = os.path.dirname(__file__)
    return os.path.join(basedir, path)

if __name__ == "__main__":
    # Point to main.py
    app_path = resolve_path("main.py")
    
    # Fake command line args
    sys.argv = [
        "streamlit",
        "run",
        app_path,
        "--global.developmentMode=false",
    ]
    sys.exit(stcli.main())
"""

# Write wrapper
with open("run_app.py", "w") as f:
    f.write(wrapper_script)

print("Building Executable...")

# Minimal Build configuration to avoid metadata errors
args = [
    'run_app.py',
    '--name=AlgoTradingBot',
    '--onefile',
    '--clean',
    # Include source files
    '--add-data=main.py;.',
    '--add-data=backend;backend',
    '--add-data=frontend;frontend',
    # Hidden imports crucial for Streamlit & dependencies
    '--hidden-import=streamlit',
    '--hidden-import=pandas',
    '--hidden-import=yfinance',
    '--hidden-import=plotly',
    # Altair is used by streamlit internally
    '--hidden-import=altair',
    '--collect-all=streamlit',
    '--collect-all=pandas_ta',
    # Only copy metadata for critical packages if strictly needed
    '--copy-metadata=streamlit'
]
PyInstaller.__main__.run(args)

print("Build Complete. Check 'dist' folder.")
