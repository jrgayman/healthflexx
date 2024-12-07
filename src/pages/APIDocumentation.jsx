import React from 'react';

export default function APIDocumentation() {
  const endpoints = [
    {
      category: 'Authentication',
      routes: [
        {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Login with email and password',
          auth: false,
          body: {
            email: 'string',
            password: 'string'
          },
          response: {
            token: 'string',
            user: 'User object'
          }
        },
        {
          method: 'POST',
          path: '/api/auth/register',
          description: 'Register new user',
          auth: false,
          body: {
            email: 'string',
            password: 'string',
            name: 'string',
            phone: 'string (optional)'
          }
        },
        {
          method: 'GET',
          path: '/api/auth/me',
          description: 'Get current user profile',
          auth: true,
          response: {
            user: 'User object'
          }
        },
        {
          method: 'PUT',
          path: '/api/auth/profile',
          description: 'Update user profile',
          auth: true,
          body: {
            name: 'string',
            phone: 'string',
            avatar_url: 'string'
          }
        }
      ]
    },
    {
      category: 'Content',
      routes: [
        {
          method: 'GET',
          path: '/api/content/featured',
          description: 'Get featured content',
          auth: false,
          response: {
            data: 'Array of content items'
          }
        },
        {
          method: 'GET',
          path: '/api/content/category/:categoryId',
          description: 'Get content by category',
          auth: false,
          query: {
            page: 'number (default: 1)',
            limit: 'number (default: 10)'
          },
          response: {
            data: 'Array of content items',
            meta: {
              total: 'number',
              page: 'number',
              last_page: 'number'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/content/search',
          description: 'Search content',
          auth: false,
          query: {
            q: 'string (search term)',
            category: 'string (category ID)',
            type: 'string (content type)',
            page: 'number (default: 1)',
            limit: 'number (default: 10)'
          }
        },
        {
          method: 'GET',
          path: '/api/content/:id',
          description: 'Get content by ID',
          auth: false
        },
        {
          method: 'POST',
          path: '/api/content/:id/like',
          description: 'Like content',
          auth: true
        },
        {
          method: 'DELETE',
          path: '/api/content/:id/like',
          description: 'Unlike content',
          auth: true
        },
        {
          method: 'GET',
          path: '/api/content/:id/likes',
          description: 'Get content likes count',
          auth: false
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-primary">HealthFlexx</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Documentation</h1>

        <div className="space-y-12">
          {endpoints.map((category) => (
            <div key={category.category} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{category.category} Endpoints</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {category.routes.map((route, index) => (
                  <div key={index} className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 text-sm font-medium rounded ${
                        route.method === 'GET' ? 'bg-green-100 text-green-800' :
                        route.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        route.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {route.method}
                      </span>
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {route.path}
                      </code>
                      {route.auth && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Requires Auth
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{route.description}</p>

                    {route.query && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Query Parameters:</h4>
                        <pre className="bg-gray-50 p-3 rounded text-sm">
                          {JSON.stringify(route.query, null, 2)}
                        </pre>
                      </div>
                    )}

                    {route.body && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Request Body:</h4>
                        <pre className="bg-gray-50 p-3 rounded text-sm">
                          {JSON.stringify(route.body, null, 2)}
                        </pre>
                      </div>
                    )}

                    {route.response && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Response:</h4>
                        <pre className="bg-gray-50 p-3 rounded text-sm">
                          {JSON.stringify(route.response, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication</h2>
          <p className="text-gray-600 mb-4">
            For endpoints that require authentication, include the JWT token in the Authorization header:
          </p>
          <pre className="bg-gray-50 p-3 rounded text-sm">
            Authorization: Bearer your-jwt-token
          </pre>
        </div>
      </div>
    </div>
  );
}