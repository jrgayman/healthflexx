import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import ContentForm from '../../components/ContentForm';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import { getImageUrl, handleImageError } from '../../lib/imageUtils';

export default function ContentManager() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');

  const contentTypes = [
    { value: 'article', label: '📄 Article' },
    { value: 'video', label: '🎥 Video' },
    { value: 'app', label: '📱 App' },
    { value: 'weblink', label: '🔗 Web Link' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'featured', label: 'Featured' }
  ];

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchCreators();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, categoryFilter, typeFilter, statusFilter, creatorFilter]);

  async function fetchCreators() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('access_level', 'Content Creator')
        .order('name');

      if (error) throw error;
      setCreators(data || []);
    } catch (error) {
      console.error('Error fetching creators:', error);
      toast.error('Failed to load creators');
    }
  }

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
      toast.error('Failed to load categories');
    }
  }

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          content_categories (
            id,
            name,
            icon
          ),
          users (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
      setFilteredPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  function filterPosts() {
    let filtered = [...posts];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(search) ||
        post.excerpt?.toLowerCase().includes(search) ||
        post.content?.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(post => 
        post.content_categories?.id === categoryFilter
      );
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(post => post.type === typeFilter);
    }

    // Status filter
    if (statusFilter) {
      switch (statusFilter) {
        case 'active':
          filtered = filtered.filter(post => post.active);
          break;
        case 'inactive':
          filtered = filtered.filter(post => !post.active);
          break;
        case 'featured':
          filtered = filtered.filter(post => post.featured);
          break;
      }
    }

    // Creator filter
    if (creatorFilter) {
      filtered = filtered.filter(post => post.creator_id === creatorFilter);
    }

    setFilteredPosts(filtered);
  }

  async function handleSubmit(data) {
    setIsSubmitting(true);
    try {
      let error;
      if (selectedPost) {
        ({ error } = await supabase
          .from('posts')
          .update(data)
          .eq('id', selectedPost.id));
      } else {
        ({ error } = await supabase
          .from('posts')
          .insert([data]));
      }

      if (error) throw error;

      toast.success(selectedPost ? 'Content updated!' : 'Content created!');
      setIsModalOpen(false);
      setSelectedPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Error saving content: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Content deleted!');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <button
          onClick={() => {
            setSelectedPost(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add New Content
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="Search content..."
        />
        <FilterDropdown
          label="Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categories.map(cat => ({
            value: cat.id,
            label: `${cat.icon} ${cat.name}`
          }))}
        />
        <FilterDropdown
          label="Type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={contentTypes}
        />
        <FilterDropdown
          label="Creator"
          value={creatorFilter}
          onChange={setCreatorFilter}
          options={creators.map(creator => ({
            value: creator.id,
            label: creator.name
          }))}
        />
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredPosts.length} of {posts.length} items
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {post.storage_path && (
                        <img
                          src={getImageUrl(post.storage_path)}
                          alt=""
                          className="h-10 w-10 rounded object-cover mr-3"
                          onError={(e) => handleImageError(e, 'small')}
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{post.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{post.users?.name || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{post.content_categories?.icon}</span>
                      <span className="text-sm text-gray-900">{post.content_categories?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">
                        {contentTypes.find(t => t.value === post.type)?.label.split(' ')[0]}
                      </span>
                      <span className="text-sm text-gray-900 capitalize">{post.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {post.active ? 'Active' : 'Draft'}
                      </span>
                      {post.featured && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setIsModalOpen(true);
                      }}
                      className="text-primary hover:text-primary-dark"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Content Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedPost ? 'Edit Content' : 'Create New Content'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPost(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ContentForm
              onSubmit={handleSubmit}
              initialData={selectedPost}
              categories={categories}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}