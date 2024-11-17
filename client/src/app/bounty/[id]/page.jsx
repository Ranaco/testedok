"use client";

import React, { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";
import styles from "./page.module.css";
import { useParams, usePathname } from "next/navigation";
import { fetchBounty } from "@/lib/methods/bounties";

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(timer); // Cleanup timer
  }, [targetDate]);

  function getTimeRemaining(date) {
    const total = Date.parse(date) - Date.now();
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);
    return { total, hours, minutes, seconds };
  }

  function formatTime(value) {
    return value < 10 ? `0${value}` : value; // Add leading zero if < 10
  }

  if (timeLeft.total <= 0) {
    return <span>Expired</span>;
  }

  return (
    <span>
      {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:
      {formatTime(timeLeft.seconds)}
    </span>
  );
}

export default function BountyDetails() {
  const [bounty, setBounty] = useState({});
  const pathname = usePathname();
  const id = pathname.split("/")[2];

  React.useEffect(() => {
    console.log("id", id);
    const fetchBountyData = async () => {
      const data = await fetchBounty(id);
      console.log(data);
      setBounty(data);
    };
    fetchBountyData();
  }, []);
  const [code, setCode] = useState("// Write your solution here");

  return (
    <div
      className={styles.container}
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      {/* Bounty Details */}
      <div className={styles["bounty-details"]}>
        <h1 className="text-left">{bounty.title}</h1>
        <p>{bounty.description}</p>

        <div>
          <div className={styles["countdown-container"]}>
            ⏳ Time Left: <Countdown targetDate={bounty.endsAt} />
          </div>
          <div className={styles["reward-container"] + " mb-10"}>
            <span className={styles.reward}>
              Reward: 💰 <strong>{bounty.reward}</strong>
            </span>
          </div>
        </div>

        <h3>Expected Output</h3>
        <p>{bounty.expectedOutput}</p>
      </div>
      {/* Editor and Test Cases */}
      <div className={styles["editor-section"]}>
        <h2>Code Solution</h2>
        <CodeMirror
          value={code}
          height="300px"
          theme={dracula}
          className={styles.CodeMirror}
          extensions={[javascript()]}
          onChange={(value) => setCode(value)}
        />
        <div className={styles["tests-section"]}>
          <h2>Test Cases</h2>
          <ul>{bounty.test}</ul>
        </div>
      </div>
    </div>
  );
}
