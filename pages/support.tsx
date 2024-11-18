"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic'; // Import dynamic for client-side-only components
import styles from "../styles/Support.module.css";

// Dynamically import the Call component, ensuring it's client-side only
const Call = dynamic(() => import('../components/Call'), { ssr: false });

const APP_ID = "5117c840eeef4bf4a4cc9493c024d732"; // Replace with your actual Agora App ID

interface Message {
  id?: string;
  text: string;
  sender: string;
  timestamp?: any;
}

const Support = () => {
  const [userName, setUserName] = useState<string>("");
  const [sessionID, setSessionID] = useState<string | null>(null);
  const [channelName, setChannelName] = useState<string>("");
  const [isClient, setIsClient] = useState<boolean>(false);

  // Set client-side flag when the component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const startSession = () => {
    if (!userName.trim()) {
      alert("Please enter your name to start the chat.");
      return;
    }

    // Generating a unique session ID and channel name
    setSessionID("session_" + new Date().getTime());
    setChannelName("support_channel_" + new Date().getTime());
  };

  if (!sessionID) {
    return (
      <div className={styles.container}>
        <h1 className={styles.header}>Welcome to Support Chat</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className={styles.input}
        />
        <button onClick={startSession} className={styles.button}>
          Start Chat
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Support Video Call</h1>
      {isClient && <Call appId={APP_ID} channelName={channelName} />}
      <div className="fixed z-10 bottom-0 left-0 right-0 flex justify-center pb-4">
        <a
          className="px-5 py-3 text-base font-medium text-center text-white bg-red-400 rounded-lg hover:bg-red-500 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 w-40"
          href="/"
        >
          End Call
        </a>
      </div>
    </div>
  );
};

export default Support;
