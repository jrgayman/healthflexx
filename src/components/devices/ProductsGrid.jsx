import { formatDistanceToNow } from 'date-fns';

export default function ProductsGrid({ products }) {
  // Group products by assigned user
  const groupedProducts = products.reduce((acc, product) => {
    const userId = product.user_id || 'unassigned';
    if (!acc[userId]) {
      acc[userId] = {
        user: {
          id: product.user_id,
          name: product.assigned_to,
          email: product.user_email
        },
        products: []
      };
    }
    acc[userId].products.push(product);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(groupedProducts).map(([userId, { user, products }]) => (
        <div key={userId} className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {user.name || 'Unassigned Devices'}
            </h3>
            {user.email && (
              <p className="text-sm text-gray-500">{user.email}</p>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MAC Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/100x100?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.device_name}</div>
                          <div className="text-sm text-gray-500">{product.device_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{product.serial_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{product.mac_address || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{product.classification}</div>
                      <div className="text-sm text-gray-500">{product.device_type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDistanceToNow(new Date(product.created_at))} ago
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}