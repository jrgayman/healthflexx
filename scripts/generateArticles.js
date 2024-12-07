import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import schedule from 'node-schedule';
import slugify from 'slugify';
import 'dotenv/config';

// ... (previous imports and setup)

async function getRandomWriter(supabase) {
  const { data: writers, error } = await supabase
    .from('writers')
    .select('id, name');
    
  if (error || !writers?.length) {
    console.error('Error fetching writers:', error);
    return null;
  }

  const randomIndex = Math.floor(Math.random() * writers.length);
  return writers[randomIndex];
}

async function generateAndSaveArticles() {
  console.log(`Generating articles at ${new Date().toISOString()}`);

  for (const category of categories) {
    try {
      console.log(`\nGenerating article for ${category.title}...`);
      
      const { title, content, excerpt } = await generateArticle(category);
      
      const slug = slugify(title, { 
        lower: true, 
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });

      // Get random writer
      const writer = await getRandomWriter(supabase);
      if (!writer) {
        throw new Error('No writers available');
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          title,
          content,
          excerpt,
          category: category.id,
          slug,
          type: 'article',
          active: true,
          featured: false,
          likes: 0,
          writer_id: writer.id,
          published_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log(`✓ Article saved: ${title} (Writer: ${writer.name})`);
      
      // Wait briefly between generations to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error processing ${category.title}:`, error);
    }
  }
}

// ... (rest of the file remains the same)