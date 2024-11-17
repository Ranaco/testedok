"use client";
import React, { useState, useEffect } from "react";
import { fetchAllBounties } from "@/lib/methods/bounties";
import { useRouter } from "next/navigation";

export default function BountyList() {
  const [bounties, setBounties] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadBounties() {
      try {
        const data = await fetchAllBounties();
        console.log("Data from data", data);
        setBounties(data);
      } catch (error) {
        console.error("Failed to load bounties:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBounties();
  }, []);

  if (loading) {
    return <div>Loading bounties...</div>;
  }

  return (
    <div className="container min-h-screen">
      <header className="hero">
        <h1 className="text-white font-medium">Bounties</h1>
        <p>
          Contribute to the Web3 ecosystem and earn rewards for your skills.
        </p>
      </header>
      <main className="bounty-list">
        {bounties.length === 0 ? (
          <p>No ongoing bounties available at the moment.</p>
        ) : (
          bounties.map((bounty: any) => (
            <a
              href={`/bounty/${bounty.id}`}
              className="bounty-card"
              key={bounty.id}
            >
              <h2>{bounty.title}</h2>
              <p>{bounty.description}</p>
              <div className="bounty-info">
                <span>Reward: ${bounty.amount}</span>
                <span>
                  Deadline: {new Date(Number(bounty.endsAt)).toUTCString()}
                </span>
              </div>
              <button
                onClick={() => router.push(`/bounty/${bounty.id}`)}
                className="claim-btn"
              >
                Claim Bounty
              </button>
            </a>
          ))
        )}
      </main>
    </div>
  );
}
