// eventview.tsx - Main Page
import Head from "next/head";
import EventView from "~/components/EventView";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import styles from '../styles/EventView.module.css';
import { useRouter } from 'next/router';

// Sample event data - in real app this would come from API/props
const sampleEventData = {
  id: '1',
  title: 'Birthday Celebration Party',
  picture: '/api/placeholder/300/200',
  description: 'Join us for an amazing birthday celebration filled with fun, laughter, and great memories. We\'ll have delicious food, music, dancing, and lots of surprises! This will be an unforgettable evening with friends and family.',
  location: 'Central Park Pavilion, New York',
  date: '07.04.2074',
  time: '18:30',
  goal: 744,
  planner: {
    id: 'p1',
    name: 'Sarah Johnson',
    profilePicture: '/api/placeholder/40/40',
    role: 'planner' as const
  },
  guests: [
    { id: 'g1', name: 'Alex Chen', profilePicture: '/api/placeholder/40/40', role: 'guest' as const },
    { id: 'g2', name: 'Maria Garcia', profilePicture: '/api/placeholder/40/40', role: 'guest' as const },
    { id: 'g3', name: 'David Wilson', profilePicture: '/api/placeholder/40/40', role: 'guest' as const },
    { id: 'g4', name: 'Emma Brown', profilePicture: '/api/placeholder/40/40', role: 'guest' as const },
    { id: 'g5', name: 'James Miller', profilePicture: '/api/placeholder/40/40', role: 'guest' as const },
    { id: 'g6', name: 'Lisa Anderson', profilePicture: '/api/placeholder/40/40', role: 'guest' as const },
    { id: 'g7', name: 'Michael Taylor', profilePicture: '/api/placeholder/40/40', role: 'guest' as const },
    { id: 'g8', name: 'Sophie Clark', profilePicture: '/api/placeholder/40/40', role: 'guest' as const }
  ]
};

export default function EventViewPage() {
  const router = useRouter();
  
  const handleContribute = () => {
    void router.push('/contributionpage');
  };

  const handleViewWishlist = () => {
    console.log('Navigate to wishlist page');
    void router.push('/wishlist');
  };

  const handleMediaView = () => {
    console.log('Navigate to media gallery');
    void router.push('/media');
  };

  const handleReport = (reason: string) => {
    console.log('Event reported:', reason);
    alert(`Event reported for: ${reason}`);
  };
  
  return (
    <>
      <Head>
        <title>Event View - GiftHub</title>
        <meta name="description" content="View event details and manage contributions" />
      </Head>
      
        <Navbar /> 
        <div className={styles.container}>
        <main>
          <EventView
            eventData={sampleEventData}
            onContribute={handleContribute}
            onViewWishlist={handleViewWishlist}
            onMediaView={handleMediaView}
            onReport={handleReport}
          />
        </main>
        </div>
        <Footer />
      
    </>
  );
}