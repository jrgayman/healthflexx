import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const body = await request.json();

  const { error } = await supabase
    .from('posts')
    .update(body)
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};