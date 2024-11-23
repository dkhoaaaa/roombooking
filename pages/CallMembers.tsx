import { Avatar } from "@stream-io/video-react-sdk";
import type { UserResponse } from "@stream-io/video-react-sdk";

type CallMembersProps = {
  members: UserResponse[];
};

export const CallMembers = ({ members }: CallMembersProps) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {members.map((member) => (
        <div key={member.id} style={{ textAlign: "center" }}>
          <Avatar name={member.name} imageSrc={member.image} size={50} />
          {member.name && (
            <div>
              <span>{member.name}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
