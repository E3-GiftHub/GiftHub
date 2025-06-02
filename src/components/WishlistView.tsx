import React, { useState, useEffect } from 'react';
import styles from '../styles/wishlistcomponent.module.css';
import { api } from '~/trpc/react';
import type { TrendingItem } from '../models/WishlistEventGuest';
import type { WishlistProps } from '../models/WishlistEventGuest';
import NotInvited from './notinvited';
import { useRouter } from 'next/router';

const USERNAME = 'user2';

// Functia asta ia imaginile based on id-ul produsului
const getItemImage = (item: TrendingItem) => {
  const productImages = [
    '/illustrations/account_visual.png',
    '/illustrations/babyShower.svg',
    '/illustrations/birthdayParty.svg',
  ];
  //daca produsu are o imagine, o pune pe aia
  if (item.imageUrl) {
    return item.imageUrl;
  }
  //altfel foloseste una de aici  gen de mai sus
  const imageIndex = item.id % productImages.length;
  return productImages[imageIndex];
};

const Wishlist: React.FC<WishlistProps> = ({ contribution, eventId }) => {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [isInvited, setIsInvited] = useState<boolean | null>(null);
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

  // verificam daca invitatia este accepted sau pending
  const { data: invitationData, isLoading: isInvitationLoading } = api.invitationPreview.getInvitationForUserEvent.useQuery(
    { eventId: Number(eventId), guestUsername: USERNAME },
    { enabled: !!eventId }
  );

  useEffect(() => {
    if (data) {
      const updatedItems = data.map(item => ({
        ...item,
         transferCompleted: item.transferCompleted === null ? false : item.transferCompleted,
      }));
      setTrendingItems(updatedItems);
    }
  }, [data]);

  useEffect(() => {
    if (invitationData) {
      setIsInvited(invitationData.status === 'ACCEPTED'); //doar accepted! fara nonchalant kings :P 
    } else if (invitationData === null) {
      setIsInvited(false);
    }
  }, [invitationData]);

  const isUserInvited = (eventData: any, username: string) => {
    if (!eventData) return false;
    //verificam daca userul este plannerrrrr
    if (eventData.planner?.username === username) return true;
    //aici verificam daca este in guest list (verificand daca obj eventdata.guests este un array si daca username-ul este in el)
    if (Array.isArray(eventData.guests)) {
      return eventData.guests.some((guest: any) => {
        if (guest.username) return guest.username === username;
        if (guest.user?.username) return guest.user.username === username;
        return false;
      });
    }
    return false;
  };

  // aratam bucla aia rotativa krazy frog cat timp se iau datele pt event :P
  if (!router.isReady || isLoading || isEventLoading || isInvitationLoading || isInvited === null) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // cinvea incearca sa acceseze wishlist-ul fara eventid
  if(!eventId) return <div>No event ID provided</div>;
  
  // cineva incearca sa acceseze wishlist ul unui event care nu exista
  if(!eventData && !isLoading) return <div>Event not found</div>;

  // verificam daca userul este invitat SI A ACCEPTAT!!!!!
  // nu pending gen e nonchalant king nu poate el raspunde...
  if (!isInvited) {
    return (
      <NotInvited/>
    );
  }
  //self explanatory :P
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
      // pentru usecaseul in care se doreste sa se faca cheta, se poate contribuii cat de mult posibil
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
                    src={getItemImage(item)}
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