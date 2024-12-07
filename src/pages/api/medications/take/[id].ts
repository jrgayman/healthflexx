```typescript
import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Record ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const now = new Date();
    const { data: record, error: recordError } = await supabase
      .from('medication_tracking_records')
      .select('*')
      .eq('id', id)
      .single();

    if (recordError) throw recordError;
    if (!record) throw new Error('Record not found');

    // Determine status based on scheduled time
    const scheduledDateTime = new Date(`${record.scheduled_date}T${record.scheduled_time}`);
    let status = 'taken';
    if (now > new Date(scheduledDateTime.getTime() + 30 * 60000)) {
      status = 'late';
    }

    // Update the record
    const { data: updatedRecord, error: updateError } = await supabase
      .from('medication_tracking_records')
      .update({
        status,
        taken_at: now.toISOString(),
        dose_count: (record.dose_count || 0) + 1
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ 
      success: true,
      record: updatedRecord
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing medication:', error);
    return new Response(JSON.stringify({ error: 'Failed to process medication' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```