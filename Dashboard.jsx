import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useState } from "react";
import "../styles/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const createMeeting = () => {
    const code = Math.random().toString(36).substring(2, 8);
    navigate(`/meeting/${code}`);
  };

  const joinMeeting = () => {
    if (!meetingCode) {
      alert("Enter meeting code");
      return;
    }
    navigate(`/meeting/${meetingCode}`);
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <button onClick={createMeeting}>New Meeting</button>

      <input
        placeholder="Enter Meeting Code"
        value={meetingCode}
        onChange={(e) => setMeetingCode(e.target.value)}
      />

      <button onClick={joinMeeting}>Join Meeting</button>

      <button className="logout" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
