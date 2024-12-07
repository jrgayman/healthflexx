import OpenAI from 'openai';
import { error } from 'console';

if (!import.meta.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

export async function generateArticle(category: string) {
  try {
    const prompt = `Write a unique, engaging article about ${category}. 
      The article should be informative, helpful, and include:
      - A catchy title
      - An engaging introduction
      - 3-4 main sections with subheadings
      - A conclusion
      - Format the content in markdown
      - Keep the content focused on health and wellness
      - Include actionable tips and advice`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 1500,
      presence_penalty: 0.6,
      frequency_penalty: 0.5
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No content generated from OpenAI');
    }

    const content = completion.choices[0].message.content;
    
    // Extract title from the markdown content
    const titleMatch = content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1] : `${category} Guide`;
    
    // Remove the title from the content
    const articleContent = content.replace(/^#\s+.+\n/, '').trim();

    return {
      title,
      content: articleContent
    };
  } catch (err) {
    console.error('Error generating article:', err);
    throw new Error(`Failed to generate article for ${category}: ${err.message}`);
  }
}

export async function generateExcerpt(content: string) {
  try {
    const prompt = `Generate a compelling 2-3 sentence excerpt from this article that will make readers want to read more: ${content.substring(0, 500)}...`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 100,
      presence_penalty: 0.3
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No excerpt generated from OpenAI');
    }

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error('Error generating excerpt:', err);
    throw new Error(`Failed to generate excerpt: ${err.message}`);
  }
}