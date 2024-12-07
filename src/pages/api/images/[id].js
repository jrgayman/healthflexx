import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Image ID is required' });
  }

  try {
    // Get image data from database
    const { data: image, error } = await supabase
      .from('images')
      .select('public_url, content_type')
      .eq('id', id)
      .single();

    if (error || !image) {
      throw error || new Error('Image not found');
    }

    // Redirect to the public URL
    res.redirect(image.public_url);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Error fetching image' });
  }
}