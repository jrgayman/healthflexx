import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

const articles = [
  {
    title: "10 Quick and Healthy Meal Prep Ideas",
    category: "food-cooking",
    content: `# 10 Quick and Healthy Meal Prep Ideas

Meal prepping is the key to maintaining a healthy diet in our busy lives. Here are 10 delicious and nutritious meal prep ideas that will save you time and keep you on track with your health goals.

## 1. Overnight Oats
Start your day right with protein-packed overnight oats. Mix oats with your choice of milk, chia seeds, and fruits.

## 2. Quinoa Buddha Bowls
Prepare a large batch of quinoa and pair it with roasted vegetables and your choice of protein.

## 3. Sheet Pan Chicken and Vegetables
A simple one-pan meal that's both nutritious and easy to portion for the week.

[... content continues ...]`,
    excerpt: "Discover 10 time-saving, nutritious meal prep ideas that will revolutionize your weekly food preparation routine and help you maintain a healthy diet.",
    image_url: "https://source.unsplash.com/random/800x600/?healthy,food",
    type: "article",
    featured: true,
    active: true
  },
  {
    title: "The Ultimate Full-Body HIIT Workout",
    category: "fitness-exercise",
    content: `# The Ultimate Full-Body HIIT Workout

High-Intensity Interval Training (HIIT) is one of the most effective ways to burn fat and build muscle. This comprehensive workout routine will help you achieve your fitness goals faster.

## Workout Structure
- 40 seconds work
- 20 seconds rest
- 4 rounds total

## Exercises
1. Burpees
2. Mountain Climbers
3. Jump Squats
4. Push-ups

[... content continues ...]`,
    excerpt: "Transform your body with this scientifically-designed HIIT workout that maximizes fat burn and muscle growth in just 30 minutes.",
    image_url: "https://source.unsplash.com/random/800x600/?fitness,workout",
    type: "article",
    featured: true,
    active: true
  },
  {
    title: "Mindful Visualization Techniques for Better Health",
    category: "hit",
    content: `# Mindful Visualization Techniques for Better Health

Health Imagery Training (HIT) is a powerful tool for improving both mental and physical well-being. Learn how to harness the power of your mind to enhance your health journey.

## The Science Behind Visualization
Research shows that mental imagery can have real physiological effects on the body.

## Key Techniques
1. Body Scanning
2. Healing Light Visualization
3. Goal Achievement Imagery

[... content continues ...]`,
    excerpt: "Learn powerful visualization techniques that can help improve your mental and physical well-being through the practice of Health Imagery Training.",
    image_url: "https://source.unsplash.com/random/800x600/?meditation,mindfulness",
    type: "article",
    featured: true,
    active: true
  },
  {
    title: "Daily Wellness Tips for Optimal Health",
    category: "daily-insights",
    content: `# Daily Wellness Tips for Optimal Health

Small daily habits can lead to significant improvements in your overall health and well-being. Here are essential tips to incorporate into your daily routine.

## Morning Routine
- Start with hydration
- Practice gratitude
- Light stretching

## Nutritional Tips
- Eat the rainbow
- Stay hydrated
- Mindful eating

[... content continues ...]`,
    excerpt: "Discover practical, science-backed daily wellness tips that you can easily incorporate into your routine for better health and vitality.",
    image_url: "https://source.unsplash.com/random/800x600/?wellness,health",
    type: "article",
    featured: true,
    active: true
  }
];

async function seedArticles() {
  console.log('Starting to seed articles...');

  for (const article of articles) {
    const slug = slugify(article.title, { 
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });

    const { error } = await supabase
      .from('posts')
      .insert({
        ...article,
        slug,
        likes: Math.floor(Math.random() * 50)
      });

    if (error) {
      console.error(`Error inserting article "${article.title}":`, error);
    } else {
      console.log(`Successfully added article: ${article.title}`);
    }
  }

  console.log('Finished seeding articles!');
}

seedArticles()
  .catch(console.error)
  .finally(() => process.exit());