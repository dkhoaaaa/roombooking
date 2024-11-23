import { useCall, useCallStateHooks, CallingState } from "@stream-io/video-react-sdk";
import { CustomRingingCall } from "./CustomRingingCall";
import { CustomActiveCallPanel } from "./CustomActiveCallPanel";

export const CallPanel = () => {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  
  if (!call) {
    return <div>Waiting for the call...</div>;
  }

  const callingState = useCallCallingState();

  if (callingState === CallingState.JOINED) {
    return <CustomActiveCallPanel />;
  } else if (
    [CallingState.RINGING, CallingState.JOINING].includes(callingState)
  ) {
    return <CustomRingingCall />;
  }

  return <div>Call has ended.</div>;
};
