import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MainLayout from '../components/layout/MainLayout';
import { getImageUrl } from '../lib/imageUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Article() {
  const { category, slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
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
            )
          `)
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
            <Link
              to="/"
              className="text-primary hover:text-primary-dark"
            >
              ← Return Home
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {post.storage_path && (
            <img 
              src={getImageUrl(post.storage_path)}
              alt={post.title}
              className="w-full h-64 object-cover"
            />
          )}
          
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <Link
                to={`/blog/${post.content_categories?.slug}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {post.content_categories?.icon} {post.content_categories?.name}
              </Link>
              <time className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString()}
              </time>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-8">{post.title}</h1>

            <div 
              className="prose prose-lg max-w-none" 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />

            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link
                to={`/blog/${post.content_categories?.slug}`}
                className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to {post.content_categories?.name}
              </Link>
            </div>
          </div>
        </article>
      </div>
    </MainLayout>
  );
}