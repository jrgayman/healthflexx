import { Link } from 'react-router-dom';

export default function Navigation() {
  const categories = [
    { id: 'food-cooking', name: 'Food & Cooking', icon: '🍳' },
    { id: 'fitness-exercise', name: 'Fitness & Exercise', icon: '💪' },
    { id: 'hit', name: 'Health Imagery Training', icon: '🧘' },
    { id: 'daily-insights', name: 'Daily Insights', icon: '✨' }
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              HealthFlexx
            </Link>
            <div className="hidden md:flex items-center space-x-4 ml-8">
              {categories.map(category => (
                <Link 
                  key={category.id}
                  to={`/blog/${category.id}`}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary rounded-md transition-colors"
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <Link 
              to="/admin/content"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}