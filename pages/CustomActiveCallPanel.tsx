import {
  useCall,
  useCallMembers,
  useCallStateHooks,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";

export const CustomActiveCallPanel = () => {
  const call = useCall();
  const members = useCallMembers();
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const { camera, isMute: isCameraMuted } = useCameraState();
  const { microphone, isMute: isMicrophoneMuted } = useMicrophoneState();

  if (!call) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Layout for all call members */}
      <div style={{ width: "100%", marginBottom: "20px" }}>
        <SpeakerLayout />
      </div>

      {/* Display the list of members */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Call Members:</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {members.map((member) => (
            <li key={member.user.id}>
              {member.user.name || "Unknown User"} {member.isSpeaking && "🎤"}
            </li>
          ))}
        </ul>
      </div>

      {/* Call Controls */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => camera.toggle()}>
          {isCameraMuted ? "Turn Camera On" : "Turn Camera Off"}
        </button>
        <button onClick={() => microphone.toggle()}>
          {isMicrophoneMuted ? "Unmute" : "Mute"}
        </button>
        <button onClick={() => call.leave()}>Leave Call</button>
      </div>
    </div>
  );
};
