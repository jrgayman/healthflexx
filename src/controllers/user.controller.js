import { supabase } from '../config/supabase.js';
import { logger } from '../config/logger.js';

export const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error(error, 'Error fetching users');
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'User not found' });
    
    res.json(data);
  } catch (error) {
    logger.error(error, `Error fetching user ${req.params.id}`);
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    logger.error(error, 'Error creating user');
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ name, email })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'User not found' });

    res.json(data);
  } catch (error) {
    logger.error(error, `Error updating user ${req.params.id}`);
    res.status(500).json({ error: error.message });
  }
};