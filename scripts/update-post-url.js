import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePostUrl() {
  try {
    // Update the specific post with the correct URL
    const { data, error } = await supabase
      .from('posts')
      .update({ 
        web_url: 'https://www.healthflexxinc.com',
        type: 'weblink'  // Ensure type is set correctly
      })
      .eq('id', '6b551755-0cfe-497a-a1ce-0a3d22d24c1b')
      .select();

    if (error) throw error;

    console.log('Post updated successfully:', data);
    return true;
  } catch (error) {
    console.error('Error updating post:', error);
    return false;
  }
}

updatePostUrl()
  .then(() => {
    console.log('Update completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Update failed:', error);
    process.exit(1);
  });