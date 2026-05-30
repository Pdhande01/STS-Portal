import { supabase } from './supabase';

export interface AuditLog {
  id: string;
  admin_email: string;
  admin_name: string;
  action_type: string;
  target: string;
  details: string;
  created_at: string;
}

export async function createAuditLog(actionType: string, target: string, details: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = user?.email || 'unknown@smarttech.com';
    const adminName = user?.user_metadata?.full_name || 'System Admin';

    const logs: AuditLog[] = JSON.parse(localStorage.getItem('sts_audit_logs') || '[]');
    
    const newLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 11),
      admin_email: adminEmail,
      admin_name: adminName,
      action_type: actionType,
      target,
      details,
      created_at: new Date().toISOString()
    };

    logs.unshift(newLog);
    // Limit to 200 logs
    localStorage.setItem('sts_audit_logs', JSON.stringify(logs.slice(0, 200)));
    console.log(`%c[AUDIT LOG] ${actionType} - ${target}: ${details}`, 'color: #8b5cf6; font-weight: bold;');
  } catch (err) {
    console.error('Failed to create audit log', err);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const logs: AuditLog[] = JSON.parse(localStorage.getItem('sts_audit_logs') || '[]');
  return logs;
}

export async function clearAuditLogs(): Promise<void> {
  localStorage.removeItem('sts_audit_logs');
}
