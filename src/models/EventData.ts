export interface User {
  id: string;
  name: string;
  profilePicture: string;
  role: "planner" | "guest";
}
export interface EventData {
  id: string;
  title: string;
  picture: string;
  description: string;
  location: string;
  date: string;
  planner: User;
  guests: User[];
}

export interface EventViewProps {
  eventData: EventData;
  onContribute?: () => void;
  onViewWishlist?: () => void;
  onMediaView?: () => void;
  onReport?: (reason: string) => void;
  onViewProfile?: (username: string) => void;
}
