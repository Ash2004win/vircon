import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import { getAuth } from "firebase/auth";
import Chat from "../components/Chat";
import "../styles/meeting.css";
import { onAuthStateChanged } from "firebase/auth";

const APP_ID = "ab352e10408145eda50920a293424622"; // 🔴 replace with real App ID

export default function Meeting() {
  const { channel } = useParams();
  const navigate = useNavigate();

  /* =======================
     AUTH → USERNAME
  ======================= */
  const auth = getAuth();
const [chatUser, setChatUser] = useState(null);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setChatUser({
        uid: user.uid,
        name:
          user.displayName ||
          user.email?.split("@")[0] ||
          "Guest",
      });
    }
  });

  return () => unsubscribe();
}, []);



  /* =======================
     REFS
  ======================= */
  const clientRef = useRef(null);
  const joinedRef = useRef(false);
  const uidRef = useRef(Math.floor(Math.random() * 100000));

  const localAudioRef = useRef(null);
  const localVideoRef = useRef(null);
  const screenTrackRef = useRef(null);

  /* =======================
     STATE
  ======================= */
  const [remoteUids, setRemoteUids] = useState([]);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  /* =======================
     LIFECYCLE
  ======================= */
  useEffect(() => {
    if (joinedRef.current) return;
    joinedRef.current = true;

    joinMeeting();
    return () => leaveMeeting();
    // eslint-disable-next-line
  }, []);

  /* =======================
     JOIN MEETING
  ======================= */
  const joinMeeting = async () => {
    try {
      // Ask browser permission
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Create Agora client
      const client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });
      clientRef.current = client;

      // Token fetch
      const uid = uidRef.current;
      const res = await fetch(
        `http://localhost:8080/token?channel=${channel}&uid=${uid}`
      );
      const { token } = await res.json();

      // Join channel
      await client.join(APP_ID, channel, token, uid);

      // Create local tracks
      const [mic, cam] =
        await AgoraRTC.createMicrophoneAndCameraTracks();

      localAudioRef.current = mic;
      localVideoRef.current = cam;

      cam.play("local-player");
      await client.publish([mic, cam]);

      // 🔹 Subscribe to users already in channel
      client.remoteUsers.forEach((user) => {
        handleUserPublished(user, "video");
        handleUserPublished(user, "audio");
      });

      // 🔹 Agora events
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserLeft);
      client.on("user-left", handleUserLeft);
    } catch (err) {
      console.error("Join failed:", err);
      alert("Failed to join meeting");
    }
  };

  /* =======================
     AGORA HANDLERS
  ======================= */
  const handleUserPublished = async (user, mediaType) => {
    if (user.uid === uidRef.current) return;

    await clientRef.current.subscribe(user, mediaType);

    setRemoteUids((prev) =>
      prev.includes(user.uid) ? prev : [...prev, user.uid]
    );

    if (mediaType === "video") {
      setTimeout(() => {
        const el = document.getElementById(`remote-${user.uid}`);
        if (el && user.videoTrack) {
          user.videoTrack.play(el);
        }
      }, 200);
    }

    if (mediaType === "audio") {
      user.audioTrack?.play();
    }
  };

  const handleUserLeft = (user) => {
    setRemoteUids((prev) => prev.filter((id) => id !== user.uid));
  };

  /* =======================
     LEAVE MEETING
  ======================= */
  const leaveMeeting = async () => {
    localAudioRef.current?.close();
    localVideoRef.current?.close();
    screenTrackRef.current?.close();

    if (clientRef.current) {
      clientRef.current.off("user-published", handleUserPublished);
      clientRef.current.off("user-unpublished", handleUserLeft);
      clientRef.current.off("user-left", handleUserLeft);
      await clientRef.current.leave();
    }

    navigate("/dashboard");
  };

  /* =======================
     CONTROLS
  ======================= */
  const toggleMute = async () => {
    await localAudioRef.current.setEnabled(muted);
    setMuted(!muted);
  };

  const toggleCamera = async () => {
    await localVideoRef.current.setEnabled(cameraOff);
    setCameraOff(!cameraOff);
  };

  const toggleScreenShare = async () => {
    const client = clientRef.current;

    if (!screenSharing) {
      const screenTrack =
        await AgoraRTC.createScreenVideoTrack(
          { encoderConfig: "1080p_1" },
          "auto"
        );

      screenTrackRef.current = screenTrack;
      await client.unpublish(localVideoRef.current);
      await client.publish(screenTrack);

      screenTrack.play("local-player");
      setScreenSharing(true);
    } else {
      await client.unpublish(screenTrackRef.current);
      await client.publish(localVideoRef.current);

      localVideoRef.current.play("local-player");
      screenTrackRef.current.close();
      screenTrackRef.current = null;
      setScreenSharing(false);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="meeting">
      <div className="video-section grid">
        {/* LOCAL VIDEO */}
        <div id="local-player" className="video-box"></div>

        {/* REMOTE VIDEOS */}
        {remoteUids.map((uid) => (
          <div
            key={uid}
            id={`remote-${uid}`}
            className="video-box"
          ></div>
        ))}

        {/* CONTROLS */}
        <div className="controls">
          <button onClick={toggleMute}>
            {muted ? "Unmute" : "Mute"}
          </button>
          <button onClick={toggleCamera}>
            {cameraOff ? "Camera On" : "Camera Off"}
          </button>
          <button onClick={toggleScreenShare}>
            {screenSharing ? "Stop Share" : "Share Screen"}
          </button>
          <button className="leave" onClick={leaveMeeting}>
            Leave
          </button>
        </div>
      </div>

      {/* CHAT WITH USERNAME */}
      {chatUser && (
  <Chat
    key={channel}
    channel={channel}
    user={chatUser}
  />
)}


    </div>
  );
}
