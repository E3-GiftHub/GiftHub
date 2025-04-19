import React, { useState } from 'react';

const Wishlistview: React.FC = () => {
  // Sample data for category and retailer buttons
  const categories = ['Sports', 'Stationery', 'Gadgets', 'Homeware', 'Beauty', 'Other'];
  const retailers = ['amazon', 'eMAG', 'RetailerC', 'RetailerD', 'RetailerE', 'RetailerF'];
  
  // State for search input
  const [searchInput, setSearchInput] = useState('');
  
  // Sample data for trending items
  const trendingItems = Array(8).fill(null).map((_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
    price: `$${Math.floor(Math.random() * 100) + 10}.99`
  }));
  
  return (
    <div className="flex justify-center items-center min-h-screen p-4 gift-hub-page">
      <div className="w-full max-w-4xl bg-indigo-900 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold text-center mb-6">Create Wishlist for event_1</h1>
        
        {/* Search Section */}
        <div className="mb-6">
          <div className="flex mb-5">
            <input
              type="text"
              placeholder="Search for a product:"
              className="flex-grow p-2 rounded-l-lg bg-indigo-100 text-gray-800 border-0"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="bg-indigo-100 rounded-r-lg p-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          {/* Category Filter */}
          <div className="mb-5">
            <p className="mb-2 text-sm">Search by category:</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className="bg-indigo-200 text-indigo-900 rounded-lg px-4 py-1 text-xs font-medium"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Retailer Filter */}
          <div className="mb-5">
            <p className="mb-2 text-sm">Search by retailer:</p>
            <div className="flex flex-wrap gap-2">
              {retailers.map((retailer, index) => (
                <button
                  key={index}
                  className={`bg-indigo-200 text-indigo-900 rounded-lg px-4 py-1 text-xs font-medium ${
                    retailer.toLowerCase() === 'amazon' || retailer.toLowerCase() === 'emag' 
                      ? 'bg-indigo-300 font-bold' 
                      : ''
                  }`}
                >
                  {retailer}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Trending Items */}
        <div>
          <p className="mb-3 text-sm">Trending items:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingItems.map(item => (
              <div key={item.id} className="mb-6 gift-item-card">
                <div className="bg-indigo-200 rounded-lg h-28 mb-2 flex items-center justify-center text-indigo-400 font-medium">
                  Photo
                </div>
                <div className="flex justify-between mb-1 px-1">
                  <span className="text-xs">Name</span>
                  <span className="text-xs">Price</span>
                </div>
                <button className="w-full wishlist-button text-white rounded-lg py-1 text-xs hover:bg-blue-600 transition">
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlistview;