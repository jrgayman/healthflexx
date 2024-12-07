import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import MainLayout from '../components/layout/MainLayout';
import Hero from '../components/home/Hero';
import CategoryGrid from '../components/home/CategoryGrid';
import FeaturedContent from '../components/home/FeaturedContent';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('content_categories')
          .select('*')
          .order('name');

        if (categoryError) throw categoryError;
        setCategories(categoryData || []);

        // Fetch featured posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            content_categories (
              id,
              name,
              icon,
              description,
              slug
            )
          `)
          .eq('featured', true)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (postsError) throw postsError;
        setFeaturedPosts(postsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout>
      <Hero />
      
      {/* Featured Content Section - Now directly below Hero */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Content</h2>
          <FeaturedContent 
            posts={featuredPosts}
            loading={loading}
          />
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <CategoryGrid 
            categories={categories}
            loading={loading}
          />
        </div>
      </div>
    </MainLayout>
  );
}