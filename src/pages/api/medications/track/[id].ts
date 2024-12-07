import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ params, request }) => {
  const { id } = params;
  
  if (!id) {
    return new Response(JSON.stringify({ error: 'Record ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { status, notes } = body;

    const updates = {
      status,
      notes,
      taken_at: ['taken', 'late', 'overtaken'].includes(status) ? new Date().toISOString() : null,
      dose_count: status === 'overtaken' ? (record.dose_count || 0) + 1 : record.dose_count || 0
    };

    const { data: record, error } = await supabase
      .from('medication_tracking_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true,
      record 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating medication status:', error);
    return new Response(JSON.stringify({ error: 'Failed to update status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};