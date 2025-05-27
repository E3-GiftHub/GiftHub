// pages/ebay.tsx
import { useState } from "react";
import { api } from "~/trpc/react";

export default function EbayTestPage() {
  const [search, setSearch] = useState("laptop");
  const { data, isLoading, refetch } = api.ebay.search.useQuery(
    { query: search },
    {
      enabled: false, // disable auto fetch
    }
  );

  const handleSearch = () => {
    refetch();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>eBay Product Search</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "0.5rem", marginRight: "1rem" }}
      />
      <button onClick={handleSearch} style={{ padding: "0.5rem 1rem" }}>
        Search
      </button>

      {isLoading && <p>Loading...</p>}

      {data && (
        <ul>
          {data.map((item: any) => (
            <li key={item.itemId}>
              <a href={item.itemWebUrl} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
