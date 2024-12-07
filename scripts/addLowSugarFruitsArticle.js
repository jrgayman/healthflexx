import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

const article = {
  title: "Top 10 Low-Sugar Fruits for a Healthier Diet",
  category: "food-cooking",
  content: `# Top 10 Low-Sugar Fruits for a Healthier Diet

Incorporating fruits into your diet is essential for obtaining vital nutrients, but it's important to be mindful of their natural sugar content. For those aiming to reduce sugar intake without sacrificing flavor and nutrition, here are ten fruits that are both delicious and low in sugar:

## Avocados
Surprisingly, avocados are fruits and contain minimal sugar—approximately 0.66 grams per 100 grams. They're also rich in healthy fats and fiber, making them a nutritious addition to meals. 

## Raspberries
With about 5 grams of sugar per cup, raspberries are a sweet yet low-sugar option. They're also high in fiber and antioxidants, supporting overall health. 

## Strawberries
Containing roughly 7 grams of sugar per cup, strawberries are a popular low-sugar fruit. They provide a significant amount of vitamin C and antioxidants. 

## Blackberries
These berries offer about 7 grams of sugar per cup and are packed with fiber and vitamins, making them a healthy, low-sugar choice. 

## Kiwis
A medium-sized kiwi has approximately 6 grams of sugar. Kiwis are also rich in vitamin C and fiber, contributing to digestive health. 

## Grapefruit
Half a medium grapefruit contains about 11 grams of sugar. This citrus fruit is high in vitamin C and can be a refreshing, low-sugar addition to your diet. 

## Peaches
A medium peach has around 13 grams of sugar. Peaches are also a good source of vitamins A and C, as well as fiber. 

## Cantaloupe
One cup of cantaloupe cubes contains about 13 grams of sugar. This melon is hydrating and provides vitamins A and C. 

## Oranges
A medium orange has approximately 12 grams of sugar. Oranges are well-known for their vitamin C content and also offer fiber. 

## Lemons and Limes
These citrus fruits are very low in sugar, with about 1 to 2 grams per fruit. They're often used to add flavor to dishes and beverages without adding significant sugar.`,
  excerpt: "Discover the top 10 fruits that are naturally low in sugar but packed with nutrients. Perfect for those looking to maintain a healthy diet while managing their sugar intake.",
  image_url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf",
  type: "article",
  featured: true,
  active: true
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
        slug,
        likes: 0
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