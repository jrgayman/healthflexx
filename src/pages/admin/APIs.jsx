import React from 'react';

export default function APIs() {
  const endpoints = [
    {
      category: 'Patient Administration',
      description: 'Patient, provider, and organization management',
      routes: [
        {
          method: 'GET',
          path: '/api/patients',
          description: 'Get all patients',
          auth: true,
          response: {
            data: 'Array of patient records'
          }
        },
        {
          method: 'GET',
          path: '/api/patients/:id',
          description: 'Get patient by ID',
          auth: true,
          response: {
            patient: 'Patient record'
          }
        },
        {
          method: 'GET',
          path: '/api/providers',
          description: 'Get all healthcare providers',
          auth: true,
          response: {
            data: 'Array of provider records'
          }
        },
        {
          method: 'GET',
          path: '/api/organizations',
          description: 'Get all organizations',
          auth: true,
          response: {
            data: 'Array of organization records'
          }
        }
      ]
    },
    {
      category: 'Clinical Data',
      description: 'Clinical observations and measurements',
      routes: [
        {
          method: 'GET',
          path: '/api/readings/types',
          description: 'Get all reading types',
          auth: true,
          response: {
            data: 'Array of reading type definitions'
          }
        },
        {
          method: 'GET',
          path: '/api/readings/:patientId',
          description: 'Get patient readings',
          auth: true,
          query: {
            type: 'string (reading type)',
            from: 'date',
            to: 'date'
          },
          response: {
            data: 'Array of readings'
          }
        },
        {
          method: 'POST',
          path: '/api/readings',
          description: 'Add new reading',
          auth: true,
          body: {
            patient_id: 'string',
            reading_type_id: 'string',
            value: 'number',
            notes: 'string (optional)'
          }
        }
      ]
    },
    {
      category: 'Medications',
      description: 'Medication management and adherence tracking',
      routes: [
        {
          method: 'GET',
          path: '/api/medications',
          description: 'Get all medications',
          auth: true,
          response: {
            data: 'Array of medications'
          }
        },
        {
          method: 'GET',
          path: '/api/patients/:id/medications',
          description: 'Get patient medications',
          auth: true,
          response: {
            data: 'Array of patient medications'
          }
        },
        {
          method: 'POST',
          path: '/api/medication-sessions/start',
          description: 'Start new medication session',
          auth: true,
          body: {
            patient_id: 'string',
            start_date: 'date'
          }
        },
        {
          method: 'POST',
          path: '/api/medication-tracking/:id',
          description: 'Update medication tracking status',
          auth: true,
          body: {
            status: 'string (taken|missed|late)',
            notes: 'string (optional)'
          }
        }
      ]
    },
    {
      category: 'Diagnostics',
      description: 'Medical device readings and diagnostics',
      routes: [
        {
          method: 'GET',
          path: '/api/devices',
          description: 'Get all medical devices',
          auth: true,
          response: {
            data: 'Array of devices'
          }
        },
        {
          method: 'GET',
          path: '/api/devices/:id/readings',
          description: 'Get device readings',
          auth: true,
          response: {
            data: 'Array of device readings'
          }
        },
        {
          method: 'POST',
          path: '/api/devices/:id/readings',
          description: 'Add device reading',
          auth: true,
          body: {
            value: 'number',
            timestamp: 'datetime',
            notes: 'string (optional)'
          }
        }
      ]
    },
    {
      category: 'Workflow',
      description: 'Task management and scheduling',
      routes: [
        {
          method: 'GET',
          path: '/api/schedules/:patientId',
          description: 'Get patient schedules',
          auth: true,
          response: {
            data: 'Array of schedules'
          }
        },
        {
          method: 'POST',
          path: '/api/schedules',
          description: 'Create new schedule',
          auth: true,
          body: {
            patient_id: 'string',
            schedule_type: 'string',
            time_slots: 'array'
          }
        }
      ]
    },
    {
      category: 'Security',
      description: 'Authentication and authorization',
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
          method: 'GET',
          path: '/api/auth/me',
          description: 'Get current user profile',
          auth: true,
          response: {
            user: 'User object'
          }
        },
        {
          method: 'POST',
          path: '/api/auth/refresh',
          description: 'Refresh access token',
          auth: true,
          response: {
            token: 'string'
          }
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">API Documentation</h1>

      <div className="space-y-12">
        {endpoints.map((category) => (
          <div key={category.category} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{category.category}</h2>
              <p className="mt-1 text-sm text-gray-500">{category.description}</p>
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
  );
}