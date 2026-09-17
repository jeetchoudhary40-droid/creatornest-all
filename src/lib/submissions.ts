import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export interface SubmissionRecord {
  id: string;
  timestamp: string;
  istTime?: string;
  source: string;
  role: string;
  applicantName: string;
  applicantEmail: string;
  subject?: string;
  isRead: boolean;
  readAt?: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'contacted';
  adminNotes?: string;
  data: Record<string, any>;
  updated_at?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqesdjhpqdwjowdiinyi.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

/**
 * Read all submissions with normalized fields.
 */
export function getSubmissions(): SubmissionRecord[] {
  try {
    ensureFileExists();
    const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
    const list = JSON.parse(raw || '[]');
    if (!Array.isArray(list)) return [];

    return list.map((item: any) => ({
      ...item,
      id: item.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: item.timestamp || item.submittedAt || new Date().toISOString(),
      istTime: item.istTime || new Date(item.timestamp || item.submittedAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      source: item.source || item.type || 'Direct Inbound',
      role: item.role || item.data?.['Role / Category'] || 'general',
      applicantName: item.applicantName || item.name || item.data?.['Full Name'] || item.data?.['Name'] || 'Applicant',
      applicantEmail: item.applicantEmail || item.email || item.data?.['Work Email'] || item.data?.['Email'] || '',
      isRead: typeof item.isRead === 'boolean' ? item.isRead : false,
      readAt: item.readAt || null,
      status: item.status || 'pending',
      adminNotes: item.adminNotes || '',
      data: item.data || item,
    }));
  } catch (err) {
    console.error('[Submissions Error] Failed to read submissions:', err);
    return [];
  }
}

/**
 * Save a new submission record.
 */
export function saveSubmission(submission: Partial<SubmissionRecord> & { applicantEmail?: string; applicantName?: string; data?: Record<string, any> }) {
  try {
    ensureFileExists();
    const list = getSubmissions();
    const now = new Date();
    const timestamp = submission.timestamp || now.toISOString();
    const istTime = submission.istTime || now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

    const newRecord: SubmissionRecord = {
      id: submission.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp,
      istTime,
      source: submission.source || 'Website Form',
      role: submission.role || 'general',
      applicantName: submission.applicantName || 'Applicant',
      applicantEmail: submission.applicantEmail || '',
      subject: submission.subject || `📬 New Application: ${submission.applicantName || 'Lead'} (Creator Nest)`,
      isRead: false,
      readAt: null,
      status: submission.status || 'pending',
      adminNotes: submission.adminNotes || '',
      data: submission.data || {},
    };

    list.unshift(newRecord);
    const trimmed = list.slice(0, 1000);
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');

    // Cloud backup to Supabase (non-blocking)
    if (supabase) {
      Promise.resolve(
        supabase.from('contact_submissions').insert({
          source: newRecord.source,
          data: newRecord.data,
          submitted_at: newRecord.timestamp,
          email: newRecord.applicantEmail || null,
          name: newRecord.applicantName || null,
        })
      ).catch((err: any) => {
        console.warn('[Supabase Backup Warning]:', err?.message || err);
      });
    }

    return newRecord;
  } catch (err) {
    console.error('[Submissions Error] Failed to save submission:', err);
    throw err;
  }
}

/**
 * Update an existing submission by ID.
 */
export function updateSubmission(id: string, updates: Partial<SubmissionRecord>) {
  try {
    ensureFileExists();
    const list = getSubmissions();
    const index = list.findIndex(s => s.id === id);
    if (index === -1) return null;

    const current = list[index];
    let isRead = updates.isRead !== undefined ? updates.isRead : current.isRead;
    let readAt = current.readAt;

    if (updates.isRead === true && !current.isRead) {
      readAt = new Date().toISOString();
    } else if (updates.isRead === false) {
      readAt = null;
    }

    const updated: SubmissionRecord = {
      ...current,
      ...updates,
      isRead,
      readAt,
      status: updates.status || current.status,
      adminNotes: updates.adminNotes !== undefined ? updates.adminNotes : current.adminNotes,
      updated_at: new Date().toISOString(),
    };

    list[index] = updated;
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('[Submissions Error] Failed to update submission:', err);
    throw err;
  }
}

/**
 * Mark all submissions as read in a single batch.
 */
export function markAllSubmissionsAsRead(): number {
  try {
    ensureFileExists();
    const list = getSubmissions();
    const nowIso = new Date().toISOString();
    let updatedCount = 0;

    const updatedList = list.map(item => {
      if (!item.isRead) {
        updatedCount++;
        return {
          ...item,
          isRead: true,
          readAt: nowIso,
          updated_at: nowIso,
        };
      }
      return item;
    });

    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(updatedList, null, 2), 'utf-8');
    return updatedCount;
  } catch (err) {
    console.error('[Submissions Error] Failed to mark all as read:', err);
    throw err;
  }
}

/**
 * Delete a submission by ID.
 */
export function deleteSubmission(id: string): boolean {
  try {
    ensureFileExists();
    const list = getSubmissions();
    const filtered = list.filter(s => s.id !== id);
    if (filtered.length === list.length) return false;

    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[Submissions Error] Failed to delete submission:', err);
    throw err;
  }
}
