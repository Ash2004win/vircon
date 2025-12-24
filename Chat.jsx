import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import "../styles/chat.css";

export default function Chat({ channel, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!channel) return;

    const q = query(
      collection(db, "meetingChats", channel, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [channel]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user?.uid) return;

    await addDoc(
      collection(db, "meetingChats", channel, "messages"),
      {
        uid: user.uid,
        name: user.name,
        text: input,
        createdAt: serverTimestamp(),
      }
    );

    setInput("");
  };

  return (
    <div className="chat-panel">
      <h3>Meeting Chat</h3>

      <div className="chat-messages">
        {messages.map((msg) => {
          const senderName = msg.name || "Unknown"; // 🔴 SAFE FALLBACK
          const isOwn = msg.uid && msg.uid === user?.uid;

          return (
            <div
              key={msg.id}
              className={`chat-message ${isOwn ? "own" : ""}`}
            >
              <div className="chat-user">{msg.name || "Unknown"}</div>
              <div className="chat-text">{msg.text}</div>
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
