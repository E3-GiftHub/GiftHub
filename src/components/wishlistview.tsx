import React, { useState, useEffect } from 'react';
import styles from '../styles/wishlistcomponent.module.css';
import { api } from '~/trpc/react';
import type { TrendingItem } from '../models/WishlistEventGuest';
import type { WishlistProps } from '../models/WishlistEventGuest';
import { useRouter } from 'next/router';

const EVENT_ID = 11;
const USERNAME = 'user2';

const Wishlist: React.FC<WishlistProps> = ({ contribution }) => {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const router = useRouter();

  const {
    data,
    isLoading,
    isError,
    refetch
  } = api.item.getAll.useQuery({ eventId: EVENT_ID, username: USERNAME });

  const setMark = api.item.setMark.useMutation({
    onSuccess: () => refetch(),
  });

  const {
    data: eventData,
    isLoading: isEventLoading
  } = api.event.getById.useQuery({ id: EVENT_ID });

  useEffect(() => {
    if(data)
      setTrendingItems(data);
  }, [data]);

  if(isLoading)
    return <div>Loading...</div>;
  if(isError)
    return <div>Failed to load items.</div>;

  const handleButtonAction = (id: number, action: 'contributing' | 'external') => {
    const item = trendingItems.find((i) => i.id === id);
    if(!item)
      return;
    let newType: 'contributing' | 'external' | 'none' = action;
    if(item.state === action)
      newType = 'none';
    setMark.mutate({
      eventId: EVENT_ID,
      articleId: id,
      username: USERNAME,
      type: newType,
      amount: newType === 'contributing' ? 7 : undefined,
    }, {
      onSuccess: () => void refetch(),
      onSettled: () => {
        setTrendingItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? { ...it, state: newType === 'none' ? 'none' : newType }
              : it
          )
        );
      },
    });
  };

  const getButtonClass = (item: TrendingItem, buttonType: 'contribute' | 'external') => {
    if((buttonType === 'contribute' && item.state === 'contributing') ||
      (buttonType === 'external' && item.state === 'external'))
      return `${styles.buttonPressed}`;
    return '';
  };

  const getButtonText = (item: TrendingItem, buttonType: 'contribute' | 'external') => {
    if(buttonType === 'contribute')
      return item.state === 'contributing' ? 'Contributing' : 'Contribute';
    if(buttonType === 'external')
      return item.state === 'external' ? 'Bought' : 'Mark Bought';
    return '';
  };

  const handleNavigation = () => {
    void router.push({
      pathname: '/some-path',
      // ...existing code...
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.wishlistContainer}>
        <h1 className={styles.title}>
          Wishlist View for {isEventLoading ? '...' : eventData?.title ?? EVENT_ID}
        </h1>
        <div className={styles.itemsContainer}>
          <div className={styles.itemsGrid}>
            {trendingItems.map((item: TrendingItem) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemImage}>
                  Photo
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