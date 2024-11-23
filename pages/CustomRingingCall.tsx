import {
  useCall,
  useCallStateHooks,
  VideoPreview,
  UserResponse,
} from "@stream-io/video-react-sdk";
import { CallCallingStateLabel } from "./CallCallingStateLabel";
import { CallControls } from "./CallControls";
import { CallMembers } from "./CallMembers";
import { useEffect } from "react";

type CustomRingingCallProps = {
  showMemberCount?: number;
};

export const CustomRingingCall = ({
  showMemberCount = 3,
}: CustomRingingCallProps) => {
  const call = useCall();
  const { useCallMembers, useCallCreatedBy, useCameraState } =
    useCallStateHooks();
  const members = useCallMembers();
  const creator = useCallCreatedBy();
  const { camera, isMute: isCameraMute } = useCameraState();

  useEffect(() => {
    camera.enable();
  }, [camera]);

  if (!call) return null;

  let membersToShow: UserResponse[] = [];
  if (call.isCreatedByMe) {
    membersToShow =
      members
        ?.slice(0, showMemberCount)
        .map(({ user }) => user)
        .filter((u) => !!u) || [];
  } else if (creator) {
    membersToShow = [creator];
  }

  return (
    <div>
      {isCameraMute ? (
        <CallMembers members={membersToShow} />
      ) : (
        <VideoPreview />
      )}
      <CallCallingStateLabel />
      <CallControls />
    </div>
  );
};
