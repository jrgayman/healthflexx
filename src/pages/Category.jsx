import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MainLayout from '../components/layout/MainLayout';
import BlogPost from '../components/BlogPost';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Category() {
  const { category } = useParams();
  const [posts, setPosts] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchCategoryAndPosts() {
      try {
        // First get the category info
        const { data: categoryData, error: categoryError } = await supabase
          .from('content_categories')
          .select('*')
          .eq('slug', category)
          .single();

        if (categoryError) throw categoryError;
        if (!categoryData) throw new Error('Category not found');
        
        setCategoryInfo(categoryData);

        // Then get posts for this category
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
          .eq('content_category_link', categoryData.id)
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (category) {
      fetchCategoryAndPosts();
    }
  }, [category]);

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (!categoryInfo) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600">The category you're looking for doesn't exist.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{categoryInfo.icon}</span>
            <h1 className="text-4xl font-bold text-gray-900">{categoryInfo.name}</h1>
          </div>
          <p className="text-lg text-gray-600">{categoryInfo.description}</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <svg 
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <BlogPost key={post.id} {...post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {searchTerm ? (
              <p className="text-gray-500">No content matches your search.</p>
            ) : (
              <p className="text-gray-500">No content available in this category yet.</p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}