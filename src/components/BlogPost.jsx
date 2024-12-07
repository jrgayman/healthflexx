import { Link } from 'react-router-dom';
import { getImageUrl, handleImageError } from '../lib/imageUtils';
import LikeButton from './LikeButton';

export default function BlogPost({ 
  id, 
  title, 
  excerpt, 
  content_categories, 
  type = 'article', 
  storage_path,
  image_url,
  video_url,
  app_store_url,
  play_store_url,
  web_url,
  duration,
  slug,
  created_at, 
  likes,
  users // Creator info from the join query
}) {
  const formattedDate = new Date(created_at).toLocaleDateString();

  if (!content_categories) {
    return null;
  }

  const categorySlug = content_categories.slug;
  const imageSource = storage_path ? getImageUrl(storage_path) : image_url;

  const isExternalVideo = type === 'video' && video_url;
  const isApp = type === 'app';
  const isWeblink = type === 'weblink';

  return (
    <article className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      {imageSource && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageSource}
            alt={title}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => handleImageError(e, 'medium')}
          />
          {type === 'video' && duration && (
            <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
              {duration}
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            to={`/blog/${categorySlug}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {content_categories.icon && (
              <span className="mr-2">{content_categories.icon}</span>
            )}
            {content_categories.name}
          </Link>
          <time className="text-sm text-gray-500">{formattedDate}</time>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isExternalVideo ? (
            <a 
              href={video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              {title}
            </a>
          ) : isWeblink ? (
            <a 
              href={web_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              {title}
            </a>
          ) : (
            <Link 
              to={`/blog/${categorySlug}/${slug}`}
              className="hover:text-primary"
            >
              {title}
            </Link>
          )}
        </h3>

        {users?.name && (
          <p className="text-sm text-gray-600 mb-2">By {users.name}</p>
        )}
        
        <p className="text-gray-600 mb-4 line-clamp-2">{excerpt}</p>
        
        <div className="flex items-center justify-between">
          {isApp ? (
            <div className="flex items-center space-x-4">
              {app_store_url && (
                <a 
                  href={app_store_url}
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
              {play_store_url && (
                <a 
                  href={play_store_url}
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
          ) : isExternalVideo ? (
            <a 
              href={video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              Watch Video
            </a>
          ) : isWeblink ? (
            <a 
              href={web_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              Visit Site
            </a>
          ) : (
            <Link 
              to={`/blog/${categorySlug}/${slug}`}
              className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Read More
            </Link>
          )}
          
          <LikeButton postId={id} initialLikes={likes} />
        </div>
      </div>
    </article>
  );
}