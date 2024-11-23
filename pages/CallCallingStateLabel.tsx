import { CallingState, useCallStateHooks, useI18n } from "@stream-io/video-react-sdk";

const CALLING_STATE_TO_LABEL: Record<CallingState, string> = {
  [CallingState.JOINING]: "Joining",
  [CallingState.RINGING]: "Ringing",
  [CallingState.RECONNECTING]: "Re-connecting",
  [CallingState.RECONNECTING_FAILED]: "Failed",
  [CallingState.OFFLINE]: "No internet connection",
  [CallingState.IDLE]: "",
  [CallingState.UNKNOWN]: "",
  [CallingState.JOINED]: "Joined",
  [CallingState.LEFT]: "Left call",
};

export const CallCallingStateLabel = () => {
  const { t } = useI18n();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const label = CALLING_STATE_TO_LABEL[callingState];

  return label ? <div>{t(label)}</div> : null;
};
