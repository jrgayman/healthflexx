import { supabase } from '../config/supabase.js';

export const getFeaturedContent = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        content_categories (
          id,
          name,
          icon,
          slug
        ),
        users (
          id,
          name
        )
      `)
      .eq('featured', true)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getContentByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('posts')
      .select(`
        *,
        content_categories (
          id,
          name,
          icon,
          slug
        ),
        users (
          id,
          name
        )
      `, { count: 'exact' })
      .eq('content_category_link', categoryId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      data,
      meta: {
        total: count,
        page: parseInt(page),
        last_page: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getContentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        content_categories (
          id,
          name,
          icon,
          slug
        ),
        users (
          id,
          name
        )
      `)
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const searchContent = async (req, res) => {
  try {
    const { q, category, type } = req.query;
    const { page = 1, limit = 10 } = req.query;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('posts')
      .select(`
        *,
        content_categories (
          id,
          name,
          icon,
          slug
        ),
        users (
          id,
          name
        )
      `, { count: 'exact' })
      .eq('active', true);

    if (q) {
      query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%,excerpt.ilike.%${q}%`);
    }

    if (category) {
      query = query.eq('content_category_link', category);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      data,
      meta: {
        total: count,
        page: parseInt(page),
        last_page: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const likeContent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { error } = await supabase
      .from('post_likes')
      .insert([{
        post_id: id,
        user_id: userId
      }]);

    if (error) throw error;

    // Get updated likes count
    const { data: post, error: countError } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', id)
      .single();

    if (countError) throw countError;

    res.json({ likes: post.likes });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const unlikeContent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { error } = await supabase
      .from('post_likes')
      .delete()
      .match({ post_id: id, user_id: userId });

    if (error) throw error;

    // Get updated likes count
    const { data: post, error: countError } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', id)
      .single();

    if (countError) throw countError;

    res.json({ likes: post.likes });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getContentLikes = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ likes: data.likes });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};