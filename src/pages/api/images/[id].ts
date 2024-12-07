import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response('Image ID is required', { status: 400 });
  }

  try {
    const { data: image, error } = await supabase
      .from('images')
      .select('data, content_type')
      .eq('id', id)
      .single();

    if (error || !image) {
      throw error || new Error('Image not found');
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image.data, 'base64');

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': image.content_type,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'ETag': `"${id}"`,
        'Last-Modified': new Date().toUTCString()
      }
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return new Response('Error fetching image', { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
};