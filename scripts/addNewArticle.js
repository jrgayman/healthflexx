import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

const article = {
  title: "Top 10 Low-Sugar Fruits for a Healthier Diet",
  content: `Incorporating fruits into your diet is essential for obtaining vital nutrients...`,
  excerpt: "Discover the top 10 fruits that are naturally low in sugar but packed with nutrients. Perfect for those looking to maintain a healthy diet while managing their sugar intake.",
  category: "food-cooking",
  type: "article",
  image_url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf",
  featured: true,
  active: true,
  likes: 0
};

async function addNewArticle() {
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
      throw error;
    }

    console.log('Article added successfully!');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

addNewArticle();