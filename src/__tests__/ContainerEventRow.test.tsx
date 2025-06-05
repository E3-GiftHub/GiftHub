import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContainerEventRow } from '../components/ui/ContainerEventRow';

// Mock the CSS modules
jest.mock('src/styles/ContainerEventRow.module.css', () => ({
  'event-row-wrapper': 'event-row-wrapper',
  'left-column': 'left-column',
  'right-column': 'right-column',
  'thumbnail': 'thumbnail',
  'title': 'title',
}));

// Mock the icons
jest.mock('react-icons/fa', () => ({
  FaCalendar: () => <span data-testid="calendar-icon">📅</span>,
}));

jest.mock('react-icons/fa6', () => ({
  FaLocationDot: () => <span data-testid="location-icon">📍</span>,
}));

describe('ContainerEventRow', () => {
  const mockEventData = {
    id: 1,
    title: 'Test Event' as string | null,
    date: new Date('2025-06-10T14:30:00Z') as Date | null,
    location: 'Test Location' as string | null,
    photo: '/test-image.jpg' as string | null,
    description: 'Test Description' as string | null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders correctly with all props provided', () => {
      render(<ContainerEventRow eventData={mockEventData} />);
      
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Test Location')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
      expect(screen.getByTestId('location-icon')).toBeInTheDocument();
    });

    it('renders the event image with correct src and alt', () => {
      render(<ContainerEventRow eventData={mockEventData} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test Event');
    });
  });

  describe('Conditional rendering - photo fallback (line 28)', () => {
    it('uses placeholder image when photo is null', () => {
      const eventDataWithNullPhoto = {
        ...mockEventData,
        photo: null,
      };
      
      render(<ContainerEventRow eventData={eventDataWithNullPhoto} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', '/placeholder.jpg');
    });

    it('uses provided photo when available', () => {
      render(<ContainerEventRow eventData={mockEventData} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', '/test-image.jpg');
    });
  });

  describe('Conditional rendering - title fallback (line 30)', () => {
    it('uses "event title" as alt text when title is null', () => {
      const eventDataWithNullTitle = {
        ...mockEventData,
        title: null,
      };
      
      render(<ContainerEventRow eventData={eventDataWithNullTitle} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'event title');
    });

    it('uses provided title as alt text when available', () => {
      render(<ContainerEventRow eventData={mockEventData} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Test Event');
    });
  });

  describe('Date handling - conditional ternary (lines 15-17)', () => {
    it('uses provided date when eventData.date exists', () => {
      const specificDate = new Date('2025-12-25T15:30:00Z');
      const eventDataWithDate = {
        ...mockEventData,
        date: specificDate,
      };
      
      render(<ContainerEventRow eventData={eventDataWithDate} />);
      
      const formattedDate = specificDate.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      
      expect(screen.getByText(new RegExp(formattedDate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument();
    });

    it('uses current date when eventData.date is null', () => {
      const eventDataWithNullDate = {
        ...mockEventData,
        date: null,
      };
      
      render(<ContainerEventRow eventData={eventDataWithNullDate} />);
      
      const datePattern = /\w{3}\s+\d{1,2},\s+\d{4},\s+\d{1,2}:\d{2}\s+(AM|PM)/;
      expect(screen.getByText(datePattern)).toBeInTheDocument();
    });
  });

  describe('Edge cases - covers all branches for 100% coverage', () => {
    it('covers photo nullish coalescing - both branches', () => {
      // Branch 1: photo is provided (left side of ??)
      const { unmount: unmount1 } = render(
        <ContainerEventRow eventData={{ ...mockEventData, photo: '/custom.jpg' }} />
      );
      let image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', '/custom.jpg');
      unmount1();

      // Branch 2: photo is null (right side of ??)
      const { unmount: unmount2 } = render(
        <ContainerEventRow eventData={{ ...mockEventData, photo: null }} />
      );
      image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', '/placeholder.jpg');
      unmount2();
    });

    it('covers title nullish coalescing - both branches', () => {
      // Branch 1: title is provided (left side of ??)
      const { unmount: unmount1 } = render(
        <ContainerEventRow eventData={{ ...mockEventData, title: 'Custom Title' }} />
      );
      let image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Custom Title');
      unmount1();

      // Branch 2: title is null (right side of ??)
      const { unmount: unmount2 } = render(
        <ContainerEventRow eventData={{ ...mockEventData, title: null }} />
      );
      image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'event title');
      unmount2();
    });

    it('covers date ternary - both branches', () => {
      const specificDate = new Date('2025-01-01T12:00:00Z');
      
      // Branch 1: date is truthy (condition true)
      const { unmount: unmount1 } = render(
        <ContainerEventRow eventData={{ ...mockEventData, date: specificDate }} />
      );
      
      const expectedFormat = specificDate.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      expect(screen.getByText(new RegExp(expectedFormat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument();
      unmount1();
      
      // Branch 2: date is null (condition false)
      const { unmount: unmount2 } = render(
        <ContainerEventRow eventData={{ ...mockEventData, date: null }} />
      );
      
      const currentDatePattern = /\w{3}\s+\d{1,2},\s+\d{4},\s+\d{1,2}:\d{2}\s+(AM|PM)/;
      expect(screen.getByText(currentDatePattern)).toBeInTheDocument();
      unmount2();
    });
  });
});