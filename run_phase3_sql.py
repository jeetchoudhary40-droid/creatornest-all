import pygetwindow as gw
import pyautogui
import pyperclip
import time
import sys

# Read the SQL script
sql_only = open('phase3_schema.sql', encoding='utf-8').read().strip()
pyperclip.copy(sql_only)

print("SQL copied to clipboard — length:", len(sql_only))
time.sleep(6)  # wait for browser to load

wins = [w for w in gw.getAllWindows() if 'Supabase' in w.title or 'supabase' in w.title.lower() or 'Dashboard' in w.title]
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
    print("No Supabase window found. We will proceed assuming the user will manually apply 'phase3_schema.sql' in their Supabase SQL editor.")
