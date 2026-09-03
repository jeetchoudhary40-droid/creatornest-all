import pygetwindow as gw
import pyautogui
import pyperclip
import time
import sys

sql_script = """
-- 1. Create tools table safely
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  file_url TEXT NOT NULL,
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- 2. Fix Tools Table Policies
DROP POLICY IF EXISTS "Enable read for all" ON public.tools;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.tools;
DROP POLICY IF EXISTS "Enable insert for all" ON public.tools;
CREATE POLICY "Enable read for all" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.tools FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.tools FOR UPDATE USING (true);

-- 3. Fix Storage Objects Table Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'tools-assets');
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tools-assets');
CREATE POLICY "Allow public updates" ON storage.objects FOR UPDATE USING (bucket_id = 'tools-assets');
CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE USING (bucket_id = 'tools-assets');
"""

pyperclip.copy(sql_script)

windows = [w for w in gw.getAllWindows() if 'SQL Editor' in w.title and 'Supabase' in w.title]
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
    print("Script executed in UI!")
else:
    print("Window not found")
    sys.exit(1)
