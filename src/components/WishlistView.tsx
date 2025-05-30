import React, { useState, useEffect } from 'react';
import styles from '../styles/wishlistcomponent.module.css';
import { api } from '~/trpc/react';
import type { TrendingItem } from '../models/WishlistEventGuest';
import type { WishlistProps } from '../models/WishlistEventGuest';
import { useRouter } from 'next/router';

const USERNAME = 'user2';

const Wishlist: React.FC<WishlistProps> = ({ contribution, eventId }) => {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const router = useRouter();

  const {
    data,
    isLoading,
    isError,
    refetch
  } = api.item.getAll.useQuery({ 
    eventId: eventId ? Number(eventId) : 0, 
    username: USERNAME 
  }, {
    enabled: !!eventId
  });

  const setMark = api.item.setMark.useMutation({
    onSuccess: () => void refetch(),
  });

  const {
    data: eventData,
    isLoading: isEventLoading
  } = api.event.getById.useQuery({ 
    id: eventId ? Number(eventId) : 0
  }, {
    enabled: !!eventId
  });

  useEffect(() => {
    if(data)
      setTrendingItems(data);
  }, [data]);

  // Show loading while router isn't ready or data is loading
  if (!router.isReady || isLoading || isEventLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // Only show no event ID error after router is ready
  if(!eventId) return <div>No event ID provided</div>;
  
  // Show error if event doesn't exist
  if(!eventData && !isLoading) return <div>Event not found</div>;
  
  if(isError)
    return <div>Failed to load items.</div>;

  const getButtonClass = (item: TrendingItem, buttonType: 'contribute' | 'external') => {
    if((buttonType === 'contribute' && item.state === 'contributing') ||
      (buttonType === 'external' && item.state === 'external'))
      return `${styles.buttonPressed}`;
    return '';
  };

  const getButtonText = (item: TrendingItem, buttonType: 'contribute' | 'external') => {
    if(buttonType === 'contribute') {
      return 'Contribute';
    }
    if(buttonType === 'external')
      return item.state === 'external' ? 'Bought' : 'Mark Bought';
    return '';
  };

  const handleButtonAction = (id: number, action: 'contributing' | 'external') => {
    const item = trendingItems.find((i) => i.id === id);
    if(!item) return;

    if (action === 'external') {
      // For external purchases, update local state immediately
      const newType = item.state === 'external' ? 'none' : 'external';
      
      // Update local state optimistically
      setTrendingItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, state: newType } : it
        )
      );

      setMark.mutate({
        eventId: Number(eventId),
        articleId: id,
        username: USERNAME,
        type: newType,
      }, {
        onError: () => {
          setTrendingItems((prev) =>
            prev.map((it) =>
              it.id === id ? { ...it, state: item.state } : it
            )
          );
        }
      });
    } else {
      // For contributions, always allow new contributions if not fully funded
      const currentAmount = Number(item.contribution?.current) || 0;
      const totalAmount = Number(item.pret);
      
      if (currentAmount < totalAmount) { 
        contribution?.();
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wishlistContainer}>
        <h1 className={styles.title}>
          Wishlist View for {isEventLoading ? '...' : eventData?.title ?? eventId}
        </h1>
        <div className={styles.itemsContainer}>
          <div className={styles.itemsGrid}>
            {trendingItems.map((item: TrendingItem) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemImage}>
                  <img
                    src={item.imageUrl ?? '/databasepic/itempic.png'} // Petru schimbi aici :P :P :D
                    alt={item.nume}
                    className={styles.actualItemImage}
                  />
                  {item.state === 'contributing' && item.contribution && (
                    <div className={styles.contributionOverlay}>
                      <div className={styles.contributionText}>
                        {item.contribution.total > 0
                          ? Math.round((item.contribution.current / item.contribution.total) * 100)
                          : 0}%
                      </div>
                      <div className={styles.contributionProgress}>
                        <div
                          className={styles.contributionBar}
                          style={{ transform: `scaleX(${item.contribution.total > 0 ? item.contribution.current / item.contribution.total : 0})` }}
                        ></div>
                      </div>
                      <div className={styles.contributionAmount}>
                        ${item.contribution.current} of ${item.contribution.total}
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <span className={styles.itemName}>{item.nume}</span>
                  <span className={styles.itemPrice}>{item.pret}</span>
                </div>
                <div className={styles.buttonsContainer}>
                  <div className={styles.actionButtonsRow}>
                    <button
                      className={`${styles.contributeButton} ${getButtonClass(item, 'contribute')}`}
                      onClick={() => handleButtonAction(item.id, 'contributing')}
                      disabled={item.state === 'external' || setMark.status === 'pending'}
                    >
                      {getButtonText(item, 'contribute')}
                    </button>
                    <button
                      className={`${styles.externalButton} ${getButtonClass(item, 'external')}`}
                      onClick={() => handleButtonAction(item.id, 'external')}
                      disabled={item.state === 'contributing' || setMark.status === 'pending'}
                    >
                      {getButtonText(item, 'external')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;