import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function relinkContentImages() {
  try {
    console.log('Starting content image relinking...');

    // First, get all posts with image_url but no image_id
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, image_url')
      .is('image_id', null)
      .not('image_url', 'is', null);

    if (postsError) throw postsError;

    console.log(`Found ${posts?.length || 0} posts to process`);

    // Process each post
    for (const post of posts || []) {
      try {
        // Fetch the image data
        const response = await fetch(post.image_url);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        // Insert into imagestorage
        const { data: image, error: imageError } = await supabase
          .from('imagestorage')
          .insert({
            name: `${post.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${blob.type.split('/')[1]}`,
            data: base64,
            content_type: blob.type
          })
          .select('id')
          .single();

        if (imageError) throw imageError;

        // Update post with new image_id
        const { error: updateError } = await supabase
          .from('posts')
          .update({ 
            image_id: image.id,
            image_url: null // Clear old image_url
          })
          .eq('id', post.id);

        if (updateError) throw updateError;

        console.log(`Successfully processed post: ${post.title}`);
      } catch (error) {
        console.error(`Error processing post ${post.title}:`, error);
      }
    }

    console.log('Content image relinking completed');
    return true;
  } catch (error) {
    console.error('Error relinking content images:', error);
    return false;
  }
}

relinkContentImages()
  .then(() => {
    console.log('Relinking process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Relinking process failed:', error);
    process.exit(1);
  });