'use client';
import { useState, useEffect } from "react";

export default function ManagePage({ params }: { params: { id: string } }) {
  
  const [isLoading, setIsLoading] = useState(true);
  const [consensusRanking, setConsensusRanking] = useState<string[]>([]);

  useEffect(() => {
    const getConsensusRanking = async () => {
      const host = process.env.SIMSCORE_API;
      const response = await fetch(`${host}/manage/${params.id}`);
      const data = await response.json();
      setIsLoading(false);
      setConsensusRanking(data.consensus_ranking);
    };
    setIsLoading(true);
    getConsensusRanking();
  }, [params.id]);
  
  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : consensusRanking ? (
        <div>
          <h2>Consensus Ranking</h2>
          <ol className="list-decimal list-inside space-y-2">
            {consensusRanking.map((idea, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded">
                {idea}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p>No consensus ranking available.</p>
      )}

    </div>
  );
}