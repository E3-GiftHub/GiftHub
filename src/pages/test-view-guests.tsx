import { useState } from "react";

type Guest = {
  guest: {
    username: string;
    fname: string | null;
    lname: string | null;
    email: string | null;
    pictureUrl: string | null;
  };
  status: string;
};

export default function TestViewGuests() {
  const [eventId, setEventId] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchGuests = async () => {
    setLoading(true);
    setError("");
    setGuests([]);
    try {
      const res = await fetch(`/api/guest-list?eventId=${eventId}`);
      if (!res.ok) {
        throw new Error("Nu s-a putut încărca lista de guests.");
      }
      const data = await res.json();
      setGuests(data);
    } catch (e: any) {
      setError(e.message || "Eroare necunoscută");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h1>Test: Vezi Guests pentru Eveniment</h1>
      <div>
        <label>ID Eveniment:</label>
        <input
          value={eventId}
          onChange={e => setEventId(e.target.value)}
          style={{ marginLeft: 8 }}
        />
        <button onClick={fetchGuests} style={{ marginLeft: 8 }}>
          Vezi Guests
        </button>
      </div>
      {loading && <p>Se încarcă...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul style={{ marginTop: 16 }}>
        {guests.map((g, idx) => (
          <li key={idx}>
            <b>{g.guest.fname} {g.guest.lname}</b> ({g.guest.username}) - Status: <i>{g.status}</i>
          </li>
        ))}
      </ul>
      {guests.length === 0 && !loading && <p>Nu există guests pentru acest eveniment.</p>}
    </div>
  );
}