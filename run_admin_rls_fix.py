import pygetwindow as gw
import pyautogui
import pyperclip
import time
import sys

try:
    sql_script = open('admin_rls_fix.sql', encoding='utf-8').read()
except Exception as e:
    print(f"Error reading admin_rls_fix.sql: {e}")
    sys.exit(1)

pyperclip.copy(sql_script)
print("SQL script copied to clipboard.")

windows = [w for w in gw.getAllWindows() if 'SQL Editor' in w.title and 'Supabase' in w.title]
if not windows:
    # Try more general lookup
    windows = [w for w in gw.getAllWindows() if 'Supabase' in w.title or 'supabase' in w.title.lower()]

if windows:
    win = windows[0]
    try:
        win.restore()
    except:
        pass
    win.activate()
    time.sleep(1.5) # Wait for window to come to foreground
    
    if win.isMaximized:
        click_x, click_y = win.width // 2, win.height // 2
    else:
        click_x, click_y = win.left + (win.width // 2), win.top + (win.height // 2)

    # Click in center to focus the Monaco editor
    pyautogui.click(click_x + 200, click_y)
    time.sleep(0.5)
    
    # Select all, delete, paste
    pyautogui.hotkey('ctrl', 'a')
    time.sleep(0.2)
    pyautogui.press('backspace')
    time.sleep(0.2)
    pyautogui.hotkey('ctrl', 'v')
    time.sleep(1.5)
    
    # Run the query in Supabase (Ctrl+Enter)
    pyautogui.hotkey('ctrl', 'enter')
    print("SUCCESS: admin_rls_fix.sql executed in Supabase UI!")
else:
    print("WARNING: Supabase window not found. Please open Supabase dashboard SQL Editor in your browser, copy the contents of 'admin_rls_fix.sql', paste it, and run it.")
