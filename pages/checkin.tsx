import { useState, useEffect } from 'react';
import { db } from '../lib/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import styles from '../styles/CheckIn.module.css';

const CheckIn = () => {
  const router = useRouter();
  const [selectedBenches, setSelectedBenches] = useState<string[]>([]);
  const [availableBenches, setAvailableBenches] = useState<string[]>([]);
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');

  useEffect(() => {
    fetchRoomData();
    setTimeIn(getCurrentTime());
  }, []);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const fetchRoomData = async () => {
    try {
      const roomRef = doc(db, 'rooms', 'room');
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        const allBenches = ['General', 'RF', 'Parametric', 'Assembly', 'Rework'];
        const benchesInUse = roomData.benchesInUse || [];

        const filteredBenches = allBenches.filter((bench) => !benchesInUse.includes(bench));
        setAvailableBenches(filteredBenches);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  };

  const handleBenchToggle = (bench: string) => {
    setSelectedBenches((prevBenches) =>
      prevBenches.includes(bench)
        ? prevBenches.filter((b) => b !== bench)
        : [...prevBenches, bench]
    );
  };

  const handleSubmit = async () => {
    if (selectedBenches.length === 0 || !timeOut) {
      alert('Please select at least one bench and specify a check-out time.');
      return;
    }

    const checkInData = {
      benches: selectedBenches,
      timeIn,
      timeOut,
      timestamp: new Date().toISOString(),
    };

    try {
      const checkInRef = collection(db, 'checkins');
      await addDoc(checkInRef, checkInData);

      const roomRef = doc(db, 'rooms', 'room');
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        const currentBenchesInUse = roomData.benchesInUse || [];
        const currentOccupancy = roomData.currentOccupancy || 0;

        const updatedBenches = Array.from(new Set([...currentBenchesInUse, ...selectedBenches]));
        const updatedOccupancy = currentOccupancy + selectedBenches.length;

        await updateDoc(roomRef, {
          benchesInUse: updatedBenches,
          currentOccupancy: updatedOccupancy,
        });
      }

      alert('Check-in successful!');
      router.push('/');
    } catch (error) {
      console.error('Error logging check-in:', error);
      alert('Failed to log check-in. Please try again.');
    }
  };

  const handleBackToMainPage = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Room Check-In</h1>

      <div className={styles.formGroup}>
        <label className={styles.label}>Select Available Benches:</label>
        <div className={styles.benchContainer}>
          {availableBenches.map((bench) => (
            <label key={bench} className={styles.benchLabel}>
              <input
                type="checkbox"
                checked={selectedBenches.includes(bench)}
                onChange={() => handleBenchToggle(bench)}
              />
              {bench}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Time In:</label>
        <input
          type="time"
          value={timeIn}
          onChange={(e) => setTimeIn(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Expected Time Out:</label>
        <input
          type="time"
          value={timeOut}
          onChange={(e) => setTimeOut(e.target.value)}
          className={styles.input}
        />
      </div>
      <div style={{display:'flex', justifyContent:'space-between'}}>
          <button onClick={handleSubmit} className={styles.submitButton}>
            Submit Check-In
          </button>

          <button onClick={handleBackToMainPage} className={styles.backButton}>
            Back to Main Page
          </button>
      </div>
    </div>
  );
};

export default CheckIn;
