import pygetwindow as gw
import pyautogui
import pyperclip
import time

sql_script = """
-- 1. Fix Infinite Recursion on Users Table
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on email" ON public.users FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- 2. Create Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  budget NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  brand_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.campaigns FOR SELECT USING (true);

-- 3. Create Tasks Table (for the tasks due widget)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.tasks FOR SELECT USING (true);

-- 4. Create Activity Logs Table (for recent activity widget)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.activity_logs FOR SELECT USING (true);

-- 5. Insert some mock data for the Admin Dashboard
INSERT INTO public.tasks (title, status, due_date) VALUES 
('Review new Brand applications', 'pending', now() - interval '1 day'),
('Approve Creator payouts', 'pending', now()),
('Setup onboarding call with Nike', 'pending', now() + interval '1 day')
ON CONFLICT DO NOTHING;

INSERT INTO public.activity_logs (action, table_name, created_at) VALUES 
('User registered', 'users', now() - interval '1 hour'),
('Campaign created', 'campaigns', now() - interval '2 hours'),
('Profile updated', 'users', now() - interval '3 hours')
ON CONFLICT DO NOTHING;
"""

pyperclip.copy(sql_script)

windows = gw.getWindowsWithTitle("List Database Triggers | SQL Editor")
if windows:
    win = windows[0]
    win.activate()
    time.sleep(1) # Wait for window to come to foreground
    
    if win.isMaximized:
        # Assuming 1920x1080 screen, SQL editor is usually on the right side
        click_x, click_y = win.width // 2, win.height // 2
    else:
        click_x, click_y = win.left + (win.width // 2), win.top + (win.height // 2)

    # Move to the center of the window and click to focus the editor
    pyautogui.click(click_x + 200, click_y) # slightly to the right to avoid sidebars
    time.sleep(0.5)
    
    # Select all, delete, paste
    pyautogui.hotkey('ctrl', 'a')
    time.sleep(0.2)
    pyautogui.press('backspace')
    time.sleep(0.2)
    pyautogui.hotkey('ctrl', 'v')
    time.sleep(1)
    
    # Run the query in Supabase (Ctrl+Enter or Cmd+Enter)
    pyautogui.hotkey('ctrl', 'enter')
    print("Script executed in UI!")
else:
    print("Window not found")
