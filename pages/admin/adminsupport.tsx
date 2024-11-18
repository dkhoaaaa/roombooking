"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic'; // Import Next.js dynamic import for SSR handling
import styles from "../../styles/AdminSupport.module.css";

// Dynamic import for the Call component, ensuring it's client-side only.
const Call = dynamic(() => import('../../components/Call'), { ssr: false });

const APP_ID = "5117c840eeef4bf4a4cc9493c024d732"; // Replace with your actual Agora App ID

interface Session {
  id: string;
  userName: string;
  isActive: boolean;
  createdAt: any;
}

const AdminSupport = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionID, setSelectedSessionID] = useState<string | null>(
    null
  );
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
    
    // Simulate active sessions for demonstration
    setSessions([
      { id: "session_1", userName: "User1", isActive: true, createdAt: new Date() },
      { id: "session_2", userName: "User2", isActive: true, createdAt: new Date() },
    ]);
  }, []);

  if (!selectedSessionID) {
    return (
      <div className={styles.container}>
        <h1 className={styles.header}>Admin Support Chat</h1>
        <div className={styles.sessionList}>
          <h2>Active Sessions</h2>
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setSelectedSessionID(session.id)}
              className={styles.sessionButton}
            >
              {session.userName} -{" "}
              {session.createdAt.toLocaleString()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Support Video Call - Admin</h1>
      {isClient && (
        <Call appId={APP_ID} channelName={selectedSessionID} />
      )}
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

export default AdminSupport;
