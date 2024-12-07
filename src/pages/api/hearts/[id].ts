import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ params, request }) => {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Post ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Call the increment function
    const { data, error } = await supabase
      .rpc('increment_post_hearts', { post_id: id });

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true,
      hearts: data 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error adding heart:', error);
    return new Response(JSON.stringify({ error: 'Failed to add heart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};