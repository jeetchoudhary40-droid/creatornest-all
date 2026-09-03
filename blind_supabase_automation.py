import pyautogui
import pyperclip
import time
import sys

print("Copying SQL to clipboard...")
sql = open('run_master_schema.py', encoding='utf-8').read()
start = sql.find('sql_script = """') + len('sql_script = """')
end = sql.rfind('"""')
sql_only = sql[start:end].strip()
pyperclip.copy(sql_only)

print("Wait 12 seconds for browser to load Supabase...")
time.sleep(12)

print("Starting automation...")
# Click in center of screen to focus the editor
pyautogui.click(x=pyautogui.size().width//2, y=pyautogui.size().height//2)
time.sleep(1)

# Select all and delete anything there
pyautogui.hotkey('ctrl', 'a')
time.sleep(0.5)
pyautogui.press('backspace')
time.sleep(0.5)

# Paste the SQL
pyautogui.hotkey('ctrl', 'v')
time.sleep(3)

# Run it
pyautogui.hotkey('ctrl', 'enter')

print("SQL execution triggered! You should see 'Success' in Supabase.")
