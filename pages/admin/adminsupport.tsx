// pages/admin/support.tsx
import { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import SimplePeer from 'simple-peer';
import styles from '../../styles/AdminSupport.module.css';

interface Message {
  id?: string;
  text: string;
  sender: string;
  timestamp?: any;
}

interface Session {
  id: string;
  userName: string;
  isActive: boolean;
  createdAt: any;
}

const AdminSupport = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionID, setSelectedSessionID] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  const userVideo = useRef<HTMLVideoElement>(null);
  const adminVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);

  useEffect(() => {
    // Get all active sessions
    const sessionsCollection = collection(db, 'supportSessions');
    const unsubscribe = onSnapshot(sessionsCollection, (snapshot) => {
      const activeSessions = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Session))
        .filter((session) => session.isActive);
      setSessions(activeSessions);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedSessionID) {
      // Listen for messages in the selected session
      const messagesCollection = collection(db, `supportSessions/${selectedSessionID}/messages`);
      const unsubscribe = onSnapshot(messagesCollection, (snapshot) => {
        const sessionMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        setMessages(sessionMessages.sort((a, b) => a.timestamp - b.timestamp));
      });

      return () => unsubscribe();
    }
  }, [selectedSessionID]);

  const sendMessage = async () => {
    if (message.trim() === '' || !selectedSessionID) return;

    const newMessage: Message = {
      text: message,
      sender: 'support',
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, `supportSessions/${selectedSessionID}/messages`), newMessage);
    setMessage('');
  };

  const endSession = async () => {
    if (selectedSessionID) {
      await updateDoc(doc(db, 'supportSessions', selectedSessionID), { isActive: false });
      setSelectedSessionID(null);
      setMessages([]);
      setIsVideoCallActive(false);
    }
  };

  const joinVideoCall = async () => {
    if (!selectedSessionID) return;
    setIsVideoCallActive(true);

    try {
      const sessionDoc = doc(db, 'webrtcSessions', selectedSessionID);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      adminVideo.current!.srcObject = stream;

      // Create SimplePeer for the admin (not initiator)
      peerRef.current = new SimplePeer({
        initiator: false,
        trickle: true, // Enable trickle for more robust connection
        stream,
        config: {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        },
      });

      // Listen for the user's offer
      onSnapshot(sessionDoc, (snapshot) => {
        const data = snapshot.data();
        if (data?.offer && peerRef.current) {
          console.log("Receiving offer from user:", data.offer);
          peerRef.current.signal(JSON.parse(data.offer));
        }
      });

      // Create an answer and send it to Firestore
      peerRef.current.on('signal', async (data) => {
        console.log("Sending answer to user:", data);
        await updateDoc(sessionDoc, { answer: JSON.stringify(data) });
      });

      // Receive user stream
      peerRef.current.on('stream', (stream) => {
        console.log("Received user stream");
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      });
    } catch (error) {
      console.error("Error joining video call:", error);
      alert("Failed to join the video call. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Admin Support Chat</h1>
      <div style={{ display: 'flex' }}>
        {/* List of Active Sessions */}
        <div className={styles.sessionList}>
          <h2>Active Sessions</h2>
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setSelectedSessionID(session.id)}
              className={styles.sessionButton}
            >
              {session.userName} - {new Date(session.createdAt.seconds * 1000).toLocaleString()}
            </button>
          ))}
        </div>

        {/* Chat Messages for Selected Session */}
        <div className={styles.chatContainer}>
          {selectedSessionID ? (
            <>
              <h2>Chat with {sessions.find((s) => s.id === selectedSessionID)?.userName}</h2>
              <div className={styles.chatBox}>
                {messages.map((msg) => (
                  <p key={msg.id} className={styles.message}>
                    <strong className={styles.sender}>{msg.sender}:</strong> {msg.text}
                  </p>
                ))}
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={styles.input}
                />
                <button onClick={sendMessage} className={styles.button}>
                  Send
                </button>
                <button onClick={endSession} className={styles.endSessionButton}>
                  End Session
                </button>
              </div>

              {/* Video Call Section */}
              <div className={styles.videoCallContainer}>
                <button onClick={joinVideoCall} className={styles.button}>
                  Join Video Call
                </button>
                {isVideoCallActive && (
                  <div className={styles.videoContainer}>
                    <video ref={adminVideo} autoPlay muted className={styles.video} />
                    <video ref={userVideo} autoPlay className={styles.video} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <p>Select a session to view messages</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
