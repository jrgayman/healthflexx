import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Post ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // First verify the post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', id)
      .single();

    if (postError || !post) {
      throw new Error('Post not found');
    }

    // Insert a new like record
    const { error: likeError } = await supabase
      .from('post_likes')
      .insert([{ post_id: id }]);

    if (likeError) {
      throw likeError;
    }

    // Get updated likes count
    const { data: updatedPost, error: countError } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', id)
      .single();

    if (countError) {
      throw countError;
    }

    return new Response(JSON.stringify({ 
      success: true,
      likes: updatedPost.likes 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing like:', error);
    return new Response(JSON.stringify({ error: 'Failed to process like' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};