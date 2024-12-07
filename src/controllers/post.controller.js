import { supabase } from '../config/supabase.js';
import { logger } from '../config/logger.js';

export const getPosts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error(error, 'Error fetching posts');
    res.status(500).json({ error: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Post not found' });
    
    res.json(data);
  } catch (error) {
    logger.error(error, `Error fetching post ${req.params.id}`);
    res.status(500).json({ error: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, content, category }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    logger.error(error, 'Error creating post');
    res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;

    const { data, error } = await supabase
      .from('posts')
      .update({ title, content, category })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Post not found' });

    res.json(data);
  } catch (error) {
    logger.error(error, `Error updating post ${req.params.id}`);
    res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    logger.error(error, `Error deleting post ${req.params.id}`);
    res.status(500).json({ error: error.message });
  }
};