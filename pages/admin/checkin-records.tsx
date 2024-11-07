// pages/admin/checkin-records.tsx
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import styles from '../../styles/CheckInRecords.module.css';

interface CheckIn {
  id: string;
  benches: string[];
  timeIn: string;
  timeOut: string;
  timestamp: string;
  checkedOut: boolean;
  checkOutTime?: string;
}

const CheckInRecords = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  useEffect(() => {
    const checkInCollection = collection(db, 'checkins');
    const unsubscribeCheckIns = onSnapshot(checkInCollection, (snapshot) => {
      const checkInList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CheckIn[];
      setCheckIns(checkInList);
    });

    return () => unsubscribeCheckIns();
  }, []);

  const handleCheckOut = async (checkInId: string) => {
    try {
      const checkOutTime = new Date().toISOString();

      // Mark the check-in as checked out with a timestamp
      await updateDoc(doc(db, 'checkins', checkInId), {
        checkedOut: true,
        checkOutTime: checkOutTime,
      });

      alert('Check-out successful.');
    } catch (error) {
      console.error('Error during check-out:', error);
      alert('Failed to check out. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Check-In Records</h1>

      <div className={styles.checkInRecords}>
        <h2>All Sessions</h2>
        {checkIns.length > 0 ? (
          checkIns.map((checkIn) => (
            <div key={checkIn.id} className={styles.checkInRecord}>
              <p><strong>Benches:</strong> {checkIn.benches.join(', ')}</p>
              <p><strong>Time In:</strong> {checkIn.timeIn}</p>
              <p><strong>Expected Time Out:</strong> {checkIn.timeOut}</p>
              <p><strong>Status:</strong> {checkIn.checkedOut ? 'Checked Out' : 'Active'}</p>
              {checkIn.checkedOut ? (
                <p><strong>Check-Out Time:</strong> {new Date(checkIn.checkOutTime!).toLocaleString()}</p>
              ) : (
                <button
                  onClick={() => handleCheckOut(checkIn.id)}
                  className={styles.checkOutButton}
                >
                  Check Out
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No check-in records available.</p>
        )}
      </div>
    </div>
  );
};

export default CheckInRecords;
