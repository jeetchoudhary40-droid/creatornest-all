import os
import sys

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sql_path = os.path.join(script_dir, 'seed_dummy_creators.sql')
    
    if not os.path.exists(sql_path):
        print(f"Error: SQL script not found at {sql_path}")
        sys.exit(1)
        
    try:
        import pyperclip
    except ImportError:
        print("Installing pyperclip library...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyperclip"])
        import pyperclip

    with open(sql_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    pyperclip.copy(sql_content)
    print("\n" + "="*80)
    print("SUCCESS: The 10 dummy creators SQL script has been copied to your clipboard!")
    print("="*80)
    print("Next Steps:")
    print("1. Go to your Supabase dashboard SQL Editor.")
    print("2. Create a new query.")
    print("3. Paste (Ctrl+V or Cmd+V) the clipboard contents.")
    print("4. Click 'Run' to populate your database with 10 dummy creators.")
    print("="*80 + "\n")

if __name__ == '__main__':
    main()
