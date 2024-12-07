import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navigation() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              HealthFlexx
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && categories.map(category => (
              <Link 
                key={category.id}
                to={`/blog/${category.slug}`}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary rounded-md transition-colors"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Link>
            ))}
            <Link 
              to="/admin/content"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              Admin Portal
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg 
                className={`h-6 w-6 ${isMenuOpen ? 'hidden' : 'block'}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                className={`h-6 w-6 ${isMenuOpen ? 'block' : 'hidden'}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {!loading && categories.map(category => (
            <Link
              key={category.id}
              to={`/blog/${category.slug}`}
              className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mr-3">{category.icon}</span>
              {category.name}
            </Link>
          ))}
          <Link
            to="/admin/content"
            className="flex items-center px-3 py-2 text-base font-medium text-white bg-primary hover:bg-primary-dark rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </nav>
  );
}