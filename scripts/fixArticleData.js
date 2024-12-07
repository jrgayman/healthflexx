import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

const article = {
  title: "Top 10 Low-Sugar Fruits for a Healthier Diet",
  content: `# Top 10 Low-Sugar Fruits for a Healthier Diet

Incorporating fruits into your diet is essential for obtaining vital nutrients, but it's important to be mindful of their natural sugar content. For those aiming to reduce sugar intake without sacrificing flavor and nutrition, here are ten fruits that are both delicious and low in sugar:

## Avocados
Surprisingly, avocados are fruits and contain minimal sugar—approximately 0.66 grams per 100 grams. They're also rich in healthy fats and fiber, making them a nutritious addition to meals.

## Raspberries
With about 5 grams of sugar per cup, raspberries are a sweet yet low-sugar option. They're also high in fiber and antioxidants, supporting overall health.

[... content continues ...]`,
  excerpt: "Discover the top 10 fruits that are naturally low in sugar but packed with nutrients. Perfect for those looking to maintain a healthy diet while managing their sugar intake.",
  category: "food-cooking",
  type: "article",
  image_url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf",
  featured: true,
  active: true
};

async function fixArticleData() {
  try {
    console.log('Starting article data fix...');

    // Create slug from title
    const slug = slugify(article.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });

    // Insert or update the article
    const { data, error } = await supabase
      .from('posts')
      .upsert([{
        ...article,
        slug
      }])
      .select();

    if (error) {
      throw error;
    }

    console.log('Article data fixed successfully:', data);
    return true;
  } catch (error) {
    console.error('Error fixing article data:', error);
    return false;
  }
}

fixArticleData()
  .then(() => {
    console.log('Article fix completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Article fix failed:', error);
    process.exit(1);
  });