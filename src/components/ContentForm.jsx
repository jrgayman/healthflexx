import { useState } from 'react';
import { generateSlug } from '../lib/slugUtils';
import ImageUpload from './ImageUpload';
import { getImageUrl } from '../lib/imageUtils';

export default function ContentForm({ 
  onSubmit, 
  initialData = null, 
  categories = [], 
  isSubmitting = false 
}) {
  const [contentType, setContentType] = useState(initialData?.type || 'article');
  const [currentStoragePath, setCurrentStoragePath] = useState(initialData?.storage_path || null);

  const contentTypes = [
    { id: 'article', name: 'Article', icon: '📄' },
    { id: 'video', name: 'Video', icon: '🎥' },
    { id: 'video-embed', name: 'Video (Embedded)', icon: '🎥' },
    { id: 'app', name: 'App', icon: '📱' },
    { id: 'weblink', name: 'Web Link', icon: '🔗' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const slug = generateSlug(title);
    
    const data = {
      title,
      slug,
      content_category_link: formData.get('category'),
      type: formData.get('type'),
      excerpt: formData.get('excerpt'),
      content: formData.get('content'),
      storage_path: currentStoragePath,
      active: formData.get('active') === 'on',
      featured: formData.get('featured') === 'on'
    };

    switch (contentType) {
      case 'video':
        data.video_url = formData.get('video_url');
        data.duration = formData.get('duration');
        data.embed_code = null;
        break;
      case 'video-embed':
        data.embed_code = formData.get('embed_code');
        data.video_url = null;
        data.duration = formData.get('duration');
        break;
      case 'app':
        data.app_store_url = formData.get('app_store_url');
        data.play_store_url = formData.get('play_store_url');
        data.video_url = null;
        data.embed_code = null;
        break;
      case 'weblink':
        data.web_url = formData.get('web_url');
        data.video_url = null;
        data.embed_code = null;
        break;
      default:
        data.video_url = null;
        data.embed_code = null;
        data.app_store_url = null;
        data.play_store_url = null;
        data.web_url = null;
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          defaultValue={initialData?.title}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            defaultValue={initialData?.content_category_link}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content Type</label>
          <select
            name="type"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            {contentTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Featured Image</label>
        <ImageUpload
          onImageUploaded={setCurrentStoragePath}
          currentStoragePath={currentStoragePath}
        />
      </div>

      {contentType === 'video' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Video URL</label>
            <input
              type="url"
              name="video_url"
              defaultValue={initialData?.video_url}
              required
              placeholder="e.g., https://youtube.com/watch?v=..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Duration</label>
            <input
              type="text"
              name="duration"
              defaultValue={initialData?.duration}
              placeholder="e.g., 5:30"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
      )}

      {contentType === 'video-embed' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Embed Code</label>
            <textarea
              name="embed_code"
              defaultValue={initialData?.embed_code}
              rows={5}
              required
              placeholder="<div style='position: relative; overflow: hidden; aspect-ratio: 1920/1080'><iframe src='...' ...></iframe></div>"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary font-mono text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">Paste the full embed code including the wrapper div with aspect ratio</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Duration</label>
            <input
              type="text"
              name="duration"
              defaultValue={initialData?.duration}
              placeholder="e.g., 5:30"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
      )}

      {contentType === 'app' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">App Store URL</label>
            <input
              type="url"
              name="app_store_url"
              defaultValue={initialData?.app_store_url}
              required
              placeholder="e.g., https://apps.apple.com/..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Play Store URL</label>
            <input
              type="url"
              name="play_store_url"
              defaultValue={initialData?.play_store_url}
              required
              placeholder="e.g., https://play.google.com/store/apps/..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
      )}

      {contentType === 'weblink' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Web URL</label>
          <input
            type="url"
            name="web_url"
            defaultValue={initialData?.web_url}
            required
            placeholder="e.g., https://example.com/..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Excerpt</label>
        <textarea
          name="excerpt"
          defaultValue={initialData?.excerpt}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          name="content"
          defaultValue={initialData?.content}
          rows={20}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary font-mono"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="active"
            defaultChecked={initialData?.active ?? true}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="ml-2 text-sm text-gray-700">Active</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initialData?.featured}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="ml-2 text-sm text-gray-700">Featured</span>
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Content' : 'Create Content')}
        </button>
      </div>
    </form>
  );
}