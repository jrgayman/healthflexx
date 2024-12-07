import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';

const supabase = createClient(
  'https://pmmkfrohclzpwpnbtajc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As'
);

const article = {
  title: "Top 10 Low-Sugar Fruits for a Healthier Diet",
  content: `# Top 10 Low-Sugar Fruits for a Healthier Diet

Incorporating fruits into your diet is essential for obtaining vital nutrients, but it's important to be mindful of their natural sugar content. For those aiming to reduce sugar intake without sacrificing flavor and nutrition, here are ten fruits that are both delicious and low in sugar:

## Avocados
Surprisingly, avocados are fruits and contain minimal sugar—approximately 0.66 grams per 100 grams. They're also rich in healthy fats and fiber, making them a nutritious addition to meals.

[... rest of your article content ...]`,
  excerpt: "Discover the top 10 fruits that are naturally low in sugar but packed with nutrients. Perfect for those looking to maintain a healthy diet while managing their sugar intake.",
  category: "food-cooking",
  type: "article",
  image_url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf",
  featured: true,
  active: true,
  likes: 0
};

async function addArticle() {
  try {
    const slug = slugify(article.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });

    const { data, error } = await supabase
      .from('posts')
      .insert([{
        ...article,
        slug
      }]);

    if (error) {
      console.error('Error inserting article:', error);
    } else {
      console.log('Article added successfully!');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

addArticle();