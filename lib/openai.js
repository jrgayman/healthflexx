import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateArticle(category) {
  try {
    const prompt = `Write a unique, engaging article about ${category}. 
      The article should be informative, helpful, and include:
      - A catchy title
      - An engaging introduction
      - 3-4 main sections with subheadings
      - A conclusion
      - Format the content in markdown
      - Keep the content focused on health and wellness
      - Include actionable tips and advice
      Maximum length: 600 words.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.6,
      frequency_penalty: 0.5
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No content generated from OpenAI');
    }

    const content = completion.choices[0].message.content;
    const titleMatch = content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1] : `${category} Guide`;
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