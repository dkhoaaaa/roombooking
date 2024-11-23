import {
  AcceptCallButton,
  CallingState,
  CancelCallButton,
  IconButton,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

export const CallControls = () => {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (!call) return null;

  if (![CallingState.RINGING, CallingState.JOINING].includes(callingState))
    return null;

  const buttonsDisabled = callingState === CallingState.JOINING;

  return (
    <div>
      <ToggleAudioButton />
      <ToggleVideoButton />
      {call.isCreatedByMe ? (
        <CancelCallButton call={call} disabled={buttonsDisabled} />
      ) : (
        <>
          <AcceptCallButton call={call} disabled={buttonsDisabled} />
          <CancelCallButton
            onClick={() => call.leave({ reject: true, reason: "decline" })}
            disabled={buttonsDisabled}
          />
        </>
      )}
    </div>
  );
};

const ToggleAudioButton = () => {
  const { useMicrophoneState } = useCallStateHooks();
  const { microphone, isMute } = useMicrophoneState();
  return (
    <IconButton
      icon={isMute ? "mic-off" : "mic"}
      onClick={() => microphone.toggle()}
    />
  );
};

const ToggleVideoButton = () => {
  const { useCameraState } = useCallStateHooks();
  const { camera, isMute } = useCameraState();
  return (
    <IconButton
      icon={isMute ? "camera-off" : "camera"}
      onClick={() => camera.toggle()}
    />
  );
};
