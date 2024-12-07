import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl, handleImageError } from '../../lib/imageUtils';
import ContentTypeIcon from '../ContentTypeIcon';
import LikeButton from '../LikeButton';

export default function FeaturedContent({ posts, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl shadow-md p-4">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <p className="text-center text-gray-500">No featured content available.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <article key={post.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          {post.storage_path && (
            <div className="relative h-48 overflow-hidden rounded-t-xl">
              <img 
                src={getImageUrl(post.storage_path)}
                alt={post.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                onError={(e) => handleImageError(e, 'medium')}
              />
              {post.type === 'video' && post.duration && (
                <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
                  {post.duration}
                </div>
              )}
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
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
            
            <h3 className="text-xl font-semibold mb-2">
              {post.type === 'video' ? (
                <a 
                  href={post.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  {post.title}
                </a>
              ) : post.type === 'weblink' ? (
                <a 
                  href={post.web_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  {post.title}
                </a>
              ) : (
                <Link 
                  to={`/blog/${post.content_categories?.slug}/${post.slug}`}
                  className="hover:text-primary"
                >
                  {post.title}
                </Link>
              )}
            </h3>

            <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
            
            <div className="flex items-center justify-between">
              {post.type === 'app' ? (
                <div className="flex items-center space-x-4">
                  {post.app_store_url && (
                    <a 
                      href={post.app_store_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-gray-700 hover:text-primary transition-colors"
                    >
                      <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      App Store
                    </a>
                  )}
                  {post.play_store_url && (
                    <a 
                      href={post.play_store_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-gray-700 hover:text-primary transition-colors"
                    >
                      <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                      </svg>
                      Play Store
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                  <ContentTypeIcon type={post.type} />
                </div>
              )}
              
              <LikeButton postId={post.id} initialLikes={post.likes} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}