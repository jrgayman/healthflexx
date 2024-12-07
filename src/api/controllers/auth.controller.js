import { supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Get additional user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Create auth user
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        email,
        name,
        phone,
        access_level: 'Reader',
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
      }]);

    if (profileError) throw profileError;

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error) throw error;

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar_url } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({ name, phone, avatar_url })
      .eq('id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};