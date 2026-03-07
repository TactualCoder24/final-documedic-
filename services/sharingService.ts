import { supabase } from './supabase';

// ============================================================================
// DOCTOR SHARING SERVICE
// ============================================================================

export interface ShareableRecord {
    id: string;
    userId: string;
    recordData: any; // JSONB snapshot of the shared data
    expiresAt: string; // ISO timestamp
    createdAt: string;
    recordType: 'medical_record' | 'health_report' | 'custom';
    title: string;
}

/**
 * Creates a time-limited shareable link for a health record.
 * Stores a snapshot of the data in the shared_records table.
 */
export async function createShareLink(
    userId: string,
    recordData: any,
    title: string,
    recordType: 'medical_record' | 'health_report' | 'custom' = 'medical_record',
    expiryHours: number = 72
): Promise<string> {
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('shared_records')
        .insert({
            user_id: userId,
            record_data: recordData,
            title,
            record_type: recordType,
            expires_at: expiresAt,
        })
        .select('id')
        .single();

    if (error) {
        console.error('Failed to create share link:', error);
        throw new Error('Failed to create share link');
    }

    // Return the share URL using the current origin + hash router
    const shareUrl = `${window.location.origin}${window.location.pathname}#/shared/${data.id}`;
    return shareUrl;
}

/**
 * Retrieves a shared record by its ID.
 * Returns null if expired or not found.
 */
export async function getSharedRecord(shareId: string): Promise<ShareableRecord | null> {
    const { data, error } = await supabase
        .from('shared_records')
        .select('*')
        .eq('id', shareId)
        .single();

    if (error || !data) {
        console.error('Shared record not found:', error);
        return null;
    }

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
        return null; // Expired
    }

    return {
        id: data.id,
        userId: data.user_id,
        recordData: data.record_data,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
        recordType: data.record_type,
        title: data.title,
    };
}

/**
 * Revokes (deletes) a shared link.
 */
export async function revokeShareLink(userId: string, shareId: string): Promise<void> {
    const { error } = await supabase
        .from('shared_records')
        .delete()
        .eq('id', shareId)
        .eq('user_id', userId);

    if (error) {
        console.error('Failed to revoke share link:', error);
        throw new Error('Failed to revoke share link');
    }
}

/**
 * Lists all active (non-expired) share links for a user.
 */
export async function getActiveShareLinks(userId: string): Promise<ShareableRecord[]> {
    const { data, error } = await supabase
        .from('shared_records')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch share links:', error);
        return [];
    }

    return (data || []).map(d => ({
        id: d.id,
        userId: d.user_id,
        recordData: d.record_data,
        expiresAt: d.expires_at,
        createdAt: d.created_at,
        recordType: d.record_type,
        title: d.title,
    }));
}
