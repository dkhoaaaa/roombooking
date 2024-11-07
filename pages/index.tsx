// pages/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';  // Import useRouter
import { db } from '../lib/firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import styles from '../styles/ClientPage.module.css';

interface Room {
  id?: string;
  name: string;
  availability: boolean;
  capacity: number;
  currentOccupancy: number;
  benchesInUse: string[];
}

const Home = () => {
  const router = useRouter(); // Initialize router
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const roomRef = doc(db, 'rooms', 'room');
    const unsubscribe = onSnapshot(roomRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setRoom(docSnapshot.data() as Room);
        setLoading(false);
      } else {
        console.log('No room data found. Generating sample data...');
        generateSampleData();
      }
    });

    return () => unsubscribe();
  }, []);

  const generateSampleData = async () => {
    const sampleRoom: Room = {
      name: 'Sample Room',
      availability: true,
      capacity: 10,
      currentOccupancy: 0,
      benchesInUse: [],
    };

    try {
      const roomRef = doc(db, 'rooms', 'room');
      await setDoc(roomRef, sampleRoom);
      console.log('Sample room data generated');
    } catch (error) {
      console.error('Error generating sample data:', error);
    }
  };

  const handleCheckIn = () => {
    router.push('/checkin'); // Navigate to the Check-In page
  };

  const handleSupportRequest = () => {
    router.push('/support');
  };

  const benches = ['General', 'RF', 'Parametric', 'Assembly', 'Rework'];

  if (loading) return <p className={styles.loading}>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Room Information</h1>

      {room ? (
        <div className={styles.roomInfo}>
          <p className={styles.roomDetail}><strong>Room Name:</strong> {room.name}</p>
          <p className={styles.roomDetail}>
            <strong>Availability:</strong> {room.availability ? 'Available' : 'Not Available'}
          </p>
          <p className={styles.roomDetail}><strong>Capacity:</strong> {room.capacity}</p>

          <div className={styles.roomDetail}>
            <strong>Benches in Use:</strong>
            <ul className={styles.benchList}>
              {benches.map((bench) => (
                <li
                  key={bench}
                  className={`${styles.bench} ${
                    room.benchesInUse.includes(bench) ? styles.inUse : ''
                  }`}
                >
                  {bench} {room.benchesInUse.includes(bench) ? '(In Use)' : '(Available)'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className={styles.roomDetail}>Room data not available.</p>
      )}

      <div className={styles.buttonGroup}>
        <button onClick={handleCheckIn} className={styles.button}>Check In</button>
        <button onClick={handleSupportRequest} className={styles.button}>
          Support
        </button>
      </div>
    </div>
  );
};

export default Home;
