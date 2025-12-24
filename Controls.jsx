import AgoraRTC from "agora-rtc-sdk-ng";
import { client } from "../utils/agora";
import { useState } from "react";

export default function Controls({ audio, video }) {
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  return (
    <div className="bg-slate-900 p-4 flex justify-center gap-4">
      <button onClick={() => { audio.setEnabled(muted); setMuted(!muted); }}>
        {muted ? "Unmute" : "Mute"}
      </button>

      <button onClick={() => { video.setEnabled(cameraOff); setCameraOff(!cameraOff); }}>
        {cameraOff ? "Camera On" : "Camera Off"}
      </button>

      <button onClick={async () => {
        const screen = await AgoraRTC.createScreenVideoTrack();
        await client.unpublish(video);
        await client.publish(screen);
      }}>
        Share Screen
      </button>
    </div>
  );
}
