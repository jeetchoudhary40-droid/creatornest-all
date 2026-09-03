import pygetwindow as gw
import pyautogui
import pyperclip
import time
import sys

# Read just the SQL from the script file
sql = open('run_master_schema.py', encoding='utf-8').read()
start = sql.find('sql_script = """') + len('sql_script = """')
end = sql.rfind('"""')
sql_only = sql[start:end].strip()
pyperclip.copy(sql_only)

print("SQL copied to clipboard — length:", len(sql_only))
time.sleep(6)  # wait for browser to load

wins = [w for w in gw.getAllWindows() if 'Supabase' in w.title or 'supabase' in w.title.lower()]
print("Windows found:", [w.title for w in wins])

if wins:
    w = wins[0]
    try:
        w.restore()
    except Exception:
        pass
    w.activate()
    time.sleep(1.5)
    cx = w.left + w.width // 2 + 200
    cy = w.top + w.height // 2
    pyautogui.click(cx, cy)
    time.sleep(0.5)
    pyautogui.hotkey('ctrl', 'a')
    time.sleep(0.2)
    pyautogui.press('backspace')
    time.sleep(0.2)
    pyautogui.hotkey('ctrl', 'v')
    time.sleep(2)
    pyautogui.hotkey('ctrl', 'enter')
    print("SQL fired in Supabase — waiting for execution...")
    time.sleep(8)
    print("Done")
else:
    print("No Supabase window found — please open https://supabase.com/dashboard and go to SQL Editor")
    sys.exit(1)
