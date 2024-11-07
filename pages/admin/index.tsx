// pages/admin/index.tsx
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebaseConfig';
import { doc, getDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';
import styles from '../../styles/AdminDashboard.module.css';

interface Room {
  id: string;
  name: string;
  availability: boolean;
  capacity: number;
  currentOccupancy: number;
  benchesInUse: string[];
}

interface CheckIn {
  id: string;
  benches: string[];
  timeIn: string;
  timeOut: string;
  timestamp: string;
  checkedOut: boolean;
  checkOutTime?: string;
}

const AdminDashboard = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [editableRoom, setEditableRoom] = useState<Room | null>(null); // Separate state for editing room info
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load room information once without real-time updates
    const fetchRoomData = async () => {
      const roomRef = doc(db, 'rooms', 'room');
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const roomData = { id: roomSnap.id, ...roomSnap.data() } as Room;
        setRoom(roomData);
        setEditableRoom(roomData); // Initialize editableRoom with room data
      }
      setLoading(false);
    };

    fetchRoomData();

    // Real-time listener for Current Sessions
    const checkInCollection = collection(db, 'checkins');
    const unsubscribeCheckIns = onSnapshot(checkInCollection, (snapshot) => {
      const activeCheckIns = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as CheckIn)) // Explicitly cast each document data as CheckIn
        .filter((checkIn) => !checkIn.checkedOut);

      setCheckIns(activeCheckIns); // Only updates Current Sessions in real-time
    });

    return () => unsubscribeCheckIns();
  }, []);

  const handleInputChange = (field: keyof Room, value: Room[keyof Room]) => {
    if (!editableRoom) return;
    setEditableRoom({ ...editableRoom, [field]: value });
  };

  const saveChanges = async () => {
    if (!editableRoom) return;

    try {
      const roomRef = doc(db, 'rooms', editableRoom.id);
      await updateDoc(roomRef, {
        name: editableRoom.name,
        availability: editableRoom.availability,
        capacity: editableRoom.capacity,
        currentOccupancy: editableRoom.currentOccupancy,
      });

      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleCheckOut = async (checkInId: string, benches: string[]) => {
    if (!room) return;

    try {
      const roomRef = doc(db, 'rooms', room.id);

      // Update room data by removing checked-out benches and updating occupancy
      const updatedBenchesInUse = room.benchesInUse.filter(
        (bench) => !benches.includes(bench)
      );
      const updatedOccupancy = Math.max(0, room.currentOccupancy - benches.length);

      await updateDoc(roomRef, {
        benchesInUse: updatedBenchesInUse,
        currentOccupancy: updatedOccupancy,
      });

      // Mark the check-in as checked out and set the check-out time
      const checkOutTime = new Date().toISOString();
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

  if (loading) return <p>Loading...</p>;
  if (!room) return <p>Room data not available</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Admin Dashboard</h1>

      {/* Room Information - Editable but not auto-updated */}
      <div className={styles.roomInfoContainer}>
        <h2 className={styles.sectionTitle}>Room Information</h2>
        <div className={styles.infoRow}>
          <label className={styles.infoLabel}>Room Name:</label>
          <input
            type="text"
            value={editableRoom?.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.infoRow}>
          <label className={styles.infoLabel}>Availability:</label>
          <input
            type="checkbox"
            checked={editableRoom?.availability || false}
            onChange={(e) => handleInputChange('availability', e.target.checked)}
            className={styles.checkbox}
          />
        </div>
        <div className={styles.infoRow}>
          <label className={styles.infoLabel}>Capacity:</label>
          <input
            type="number"
            value={editableRoom?.capacity || 0}
            onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
            className={styles.input}
          />
        </div>
        <button onClick={saveChanges} className={styles.saveButton}>
          Save Changes
        </button>
      </div>

      {/* Current Sessions - Real-time updates */}
      <div className={styles.checkInRecords}>
        <h2>Current Sessions</h2>
        {checkIns.length > 0 ? (
          checkIns.map((checkIn) => (
            <div key={checkIn.id} className={styles.checkInRecord}>
              <p><strong>Benches:</strong> {checkIn.benches.join(', ')}</p>
              <p><strong>Time In:</strong> {checkIn.timeIn}</p>
              <p><strong>Expected Time Out:</strong> {checkIn.timeOut}</p>
              <button
                onClick={() => handleCheckOut(checkIn.id, checkIn.benches)}
                className={styles.checkOutButton}
              >
                Check Out
              </button>
            </div>
          ))
        ) : (
          <p>No active sessions.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
