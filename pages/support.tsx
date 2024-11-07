// pages/support.tsx
import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebaseConfig';
import { collection, addDoc, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import SimplePeer from 'simple-peer';
import styles from '../styles/Support.module.css';

interface Message {
  id?: string;
  text: string;
  sender: string;
  timestamp?: any;
}

const Support = () => {
  const [userName, setUserName] = useState<string>('');
  const [sessionID, setSessionID] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const userVideo = useRef<HTMLVideoElement>(null);
  const adminVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);

  // Firestore signaling references
  const sessionRef = sessionID ? doc(db, 'webrtcSessions', sessionID) : null;

  useEffect(() => {
    if (sessionID) {
      const messagesCollection = collection(db, `supportSessions/${sessionID}/messages`);
      const unsubscribe = onSnapshot(messagesCollection, (snapshot) => {
        const chatMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        setMessages(chatMessages.sort((a, b) => a.timestamp - b.timestamp));
      });
      return () => unsubscribe();
    }
  }, [sessionID]);

  const startSession = async () => {
    if (!userName.trim()) return alert('Please enter your name to start the chat.');

    const sessionRef = await addDoc(collection(db, 'supportSessions'), {
      userName,
      createdAt: new Date(),
      isActive: true,
    });
    setSessionID(sessionRef.id);
  };

  const sendMessage = async () => {
    if (message.trim() === '' || !sessionID) return;

    const newMessage: Message = {
      text: message,
      sender: userName,
      timestamp: new Date(),
    };

    await addDoc(collection(db, `supportSessions/${sessionID}/messages`), newMessage);
    setMessage('');
  };

  const startVideoCall = async () => {
    setIsVideoCallActive(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    userVideo.current!.srcObject = stream;

    // Initialize SimplePeer for user (initiator)
    peerRef.current = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    // When peer connection is established, set up signaling
    peerRef.current.on('signal', async (data) => {
      await updateDoc(sessionRef!, { offer: JSON.stringify(data) });
    });

    // Listen for answer from Firestore
    onSnapshot(sessionRef!, (snapshot) => {
      const data = snapshot.data();
      if (data?.answer && peerRef.current) {
        peerRef.current.signal(JSON.parse(data.answer));
      }
    });

    // Receive admin stream
    peerRef.current.on('stream', (stream) => {
      adminVideo.current!.srcObject = stream;
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Support Chat</h1>
      {sessionID ? (
        <>
          <div className={styles.chatBox}>
            {messages.map((msg) => (
              <p key={msg.id}>
                <strong>{msg.sender}:</strong> {msg.text}
              </p>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.input}
          />
          <button onClick={sendMessage} className={styles.button}>
            Send Message
          </button>
          <button onClick={startVideoCall} className={styles.button}>
            Start Video Call
          </button>

          {/* Video elements */}
          {isVideoCallActive && (
            <div className={styles.videoContainer}>
              <video ref={userVideo} autoPlay muted className={styles.video} />
              <video ref={adminVideo} autoPlay className={styles.video} />
            </div>
          )}
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Support;
