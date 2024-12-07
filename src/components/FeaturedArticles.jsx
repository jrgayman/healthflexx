import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function FeaturedArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFeaturedArticles() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('featured', true)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          throw error;
        }

        setArticles(data || []);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedArticles();
  }, []);

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>Loading featured articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-600">Error loading articles: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
        
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <Link 
                key={article.id}
                to={`/article/${article.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {article.image_url && (
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No featured articles found.</p>
        )}
      </div>
    </section>
  );
}