import { supabase } from './supabase';

export async function getRandomWriter() {
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