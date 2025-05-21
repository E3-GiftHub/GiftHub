import React, { useState, useEffect } from 'react';
import styles from '../styles/WishlistView.module.css';

// Define possible item states
type ItemState = 'none' | 'wishlist' | 'reserved' | 'contributing';

interface TrendingItem {
  id: number;
  nume: string;
  pret: string;
  state: ItemState;
}

const sampleItems: TrendingItem[] = [
  { id: 1, nume: 'Item 1', pret: '$74', state: 'none' },
  { id: 2, nume: 'Item 2', pret: '$74', state: 'none' },
  { id: 3, nume: 'Item 3', pret: '$74', state: 'none' },
  { id: 4, nume: 'Item 4', pret: '$74', state: 'none' },
  { id: 5, nume: 'Item 5', pret: '$74', state: 'none' },
  { id: 6, nume: 'Item 6', pret: '$74', state: 'none' },
  { id: 7, nume: 'Item 7', pret: '$74', state: 'none' },
  { id: 8, nume: 'Item 8', pret: '$74', state: 'none' }
];

const WishlistView: React.FC = () => {
  const categories = ['Sports', 'Stationery', 'Gadgets', 'Homeware', 'Beauty', 'Other'];
  const retailers = ['amazon', 'eMAG', 'RetailerC', 'RetailerD', 'RetailerE', 'RetailerF'];
  
  const [searchInput, setSearchInput] = useState('');
  
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  
  useEffect(() => {
    setTrendingItems(sampleItems);
  }, []);
  
  const handleButtonAction = (id: number, action: 'buy' | 'wishlist' | 'reserve' | 'contribute') => {
    if (action === 'buy') {
      window.open('https://www.google.com');
      return;
    }
    
    setTrendingItems(items => 
      items.map(item => {
        if (item.id === id) {
          if (
            (action === 'wishlist' && item.state === 'wishlist') ||
            (action === 'reserve' && item.state === 'reserved') ||
            (action === 'contribute' && item.state === 'contributing')
          ) {
            return { ...item, state: 'none' };
          }
          
          const newState: ItemState = 
            action === 'wishlist' ? 'wishlist' :
            action === 'reserve' ? 'reserved' :
            action === 'contribute' ? 'contributing' :
            'none';
            
          return { ...item, state: newState };
        }
        return item;
      })
    );
  };

  const getButtonClass = (item: TrendingItem, buttonType: 'wishlist' | 'reserve' | 'contribute') => {
    if (buttonType === 'wishlist') {
      return item.state === 'wishlist' ? styles.wishlistButtonActive : styles.wishlistButton;
    } else if (buttonType === 'reserve') {
      return item.state === 'reserved' ? `${styles.reserveButton} ${styles.btnActive}` : styles.reserveButton;
    } else if (buttonType === 'contribute') {
      return item.state === 'contributing' ? `${styles.contributeButton} ${styles.btnActive}` : styles.contributeButton;
    }
    return '';
  };
  
  const getButtonText = (item: TrendingItem, buttonType: 'wishlist' | 'reserve' | 'contribute') => {
    if (buttonType === 'wishlist') {
      return item.state === 'wishlist' ? 'Added to Wishlist' : 'Add to Wishlist';
    } else if (buttonType === 'reserve') {
      return item.state === 'reserved' ? 'Reserved' : 'Reserve';
    } else if (buttonType === 'contribute') {
      return item.state === 'contributing' ? 'Contributing' : 'Mark as Contribution';
    }
    return '';
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.wishlistContainer}>
        <h1 className={styles.title}>Wishlist View for event_1</h1>
        
        {/* Search Section */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search for a product:"
              className={styles.searchInput}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className={styles.searchButton}>
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          {/* Category Filter */}
          <div className={styles.filterSection}>
            <p className={styles.filterLabel}>Search by category:</p>
            <div className={styles.filterButtons}>
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={styles.categoryButton}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Retailer Filter */}
          <div className={styles.filterSection}>
            <p className={styles.filterLabel}>Search by retailer:</p>
            <div className={styles.filterButtons}>
              {retailers.map((retailer, index) => (
                <button
                  key={index}
                  className={`${styles.retailerButton} ${
                    retailer.toLowerCase() === 'amazon' || retailer.toLowerCase() === 'emag' 
                      ? styles.selectedRetailer 
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
        <div className={styles.itemsContainer}>
          <p className={styles.itemsLabel}>Trending items:</p>
          <div className={styles.itemsGrid}>
            {trendingItems.map(item => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemImage}>
                  Photo
                </div>
                <div className={styles.itemDetails}>
                  <span className={styles.itemName}>{item.nume}</span>
                  <span className={styles.itemPrice}>{item.pret}</span>
                </div>
                <div className={styles.buttonsContainer}>
                  {/* Wishlist button */}
                  <button 
                    className={getButtonClass(item, 'wishlist')}
                    onClick={() => handleButtonAction(item.id, 'wishlist')}
                  >
                    {getButtonText(item, 'wishlist')}
                  </button>
                  
                  {/* Buy and Reserve buttons */}
                  <div className={styles.actionButtonsRow}>
                    {/* Buy button - redirects */}
                    <button 
                      className={styles.buyButton}
                      onClick={() => handleButtonAction(item.id, 'buy')}
                    >
                      Buy
                    </button>
                    
                    {/* Reserve button - changes label */}
                    <button 
                      className={getButtonClass(item, 'reserve')}
                      onClick={() => handleButtonAction(item.id, 'reserve')}
                    >
                      {getButtonText(item, 'reserve')}
                    </button>
                  </div>
                  
                  {/* Contribution button - changes label */}
                  <button 
                    className={getButtonClass(item, 'contribute')}
                    onClick={() => handleButtonAction(item.id, 'contribute')}
                  >
                    {getButtonText(item, 'contribute')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistView;