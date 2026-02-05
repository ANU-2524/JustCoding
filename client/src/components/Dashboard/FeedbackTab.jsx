import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../Style/UserDashboard.css';

const FeedbackTab = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'feedback'));
      const feedbackData = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setFeedbackList(feedbackData);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this feedback?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'feedback', id));
      setFeedbackList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback. Please try again.');
    }
  };

  return (
    <div className="dashboard-section">
      <h2>User Feedback</h2>

      {loading ? (
        <p>Loading feedback...</p>
      ) : feedbackList.length === 0 ? (
        <p>No feedback submitted yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {feedbackList.map((feedback) => (
                <tr key={feedback.id}>
                  <td>{feedback.name || 'Anonymous'}</td>
                  <td>{feedback.email || '-'}</td>
                  <td>{feedback.message}</td>
                  <td>
                    {feedback.createdAt?.seconds
                      ? new Date(feedback.createdAt.seconds * 1000).toLocaleString()
                      : '-'}
                  </td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(feedback.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeedbackTab;
