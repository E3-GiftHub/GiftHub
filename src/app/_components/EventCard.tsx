type EventCardProps = {
  name: string;
  description: string;
  date: string;
  location: string;
  image: string;
};

export default function EventCard({ name, description, date, location, image }: EventCardProps) {
  return (
    <div className="bg-[#2E236B] text-white rounded-lg p-6 max-w-3xl mx-auto shadow-lg border border-[#433D8A]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-center w-full">{name}</h2>
        <button className="text-[#A7A9D5] hover:text-white absolute top-4 right-4">
          <i className="fas fa-info-circle"></i>
        </button>
      </div>

      {/* Content */}
      <div className="flex space-x-4 bg-[#433D8A] p-4 rounded-lg">
        <img src={image} alt="Event" className="w-40 h-40 object-cover rounded-md" />
        <div className="flex-1 space-y-2 text-sm">
          <p className="bg-[#2E236B] p-2 rounded-md">
            <strong>Date:</strong> {date}
          </p>
          <p className="bg-[#2E236B] p-2 rounded-md">
            <strong>Location:</strong> {location}
          </p>
          <p className="bg-[#2E236B] p-4 rounded-md mt-4">{description}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-6">
        {/* Reject Invite Button - Highlight State */}
        <button className="px-6 py-2 rounded border border-[#C7ACD5] text-[#C7ACD5] hover:bg-white hover:scale-105 text-[#2E236B] transition-transform duration-300">
          Reject invite
        </button>

        {/* Accept Invite Button - Regular State */}
        <button className="px-6 py-2 rounded bg-gradient-to-r from-[#C7ACD5] to-[#A7A9D5] hover:from-[#A7A9D5] hover:to-[#C7ACD5] hover:shadow-lg hover:scale-105 text-white transition-transform duration-300">
          Accept invite
        </button>
      </div>
    </div>
  );
}
