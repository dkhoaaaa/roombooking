import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useChannelStateContext,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import {
  StreamVideo,
  StreamTheme,
  StreamVideoClient,
  useCalls,
  CallingState,
  StreamCall,
  RingingCall,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import styles from "../../styles/AdminSupport.module.css";

const apiKey = "ye2nkek6ste4";
const adminUserName = "Admin Support";
const adminUserId = "admin";

const tokenProvider = async (userId: string): Promise<string> => {
  try {
    const response = await fetch(
      "https://pronto.getstream.io/api/auth/create-token?" +
        new URLSearchParams({ api_key: apiKey, user_id: userId })
    );

    if (!response.ok) {
      throw new Error("Failed to fetch token from the server.");
    }

    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw new Error("Unable to fetch token. Please try again later.");
  }
};

const AdminSupport = () => {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initStream = async () => {
      try {
        const chatClientInstance = StreamChat.getInstance(apiKey);
        const token = await tokenProvider(adminUserId);

        await chatClientInstance.connectUser(
          { id: adminUserId, name: adminUserName },
          token
        );

        setChatClient(chatClientInstance);

        const videoClientInstance = new StreamVideoClient({
          apiKey,
          user: { id: adminUserId, name: adminUserName },
          tokenProvider: () => tokenProvider(adminUserId),
        });

        setVideoClient(videoClientInstance);
      } catch (err) {
        console.error("Error initializing Stream clients:", err);
        router.push("/admin/adminsupport");
      }
    };

    initStream();
  }, [router]);

  if (!chatClient || !videoClient) {
    return <div style={{ textAlign: "center", marginTop: "20px" }}>Loading admin support...</div>;
  }

  const filters = { type: "messaging", members: { $in: [adminUserId] } };
  const sort = { last_message_at: -1 };

  return (
    <div>
      {/* Top Banner */}
      <div
        className="top-banner-container"
        style={{
          display: "flex",
          maxWidth: "97vw",
          margin: "0 auto",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
        }}
      >
        <img
          className="top-banner-image"
          src="https://people.ece.ubc.ca/~haileynadine/assets/UBC.png"
          alt="UBC Logo"
          style={{ height: "50px", marginRight: "20px" }}
        />
        <img
          className="top-banner-image"
          src="https://people.ece.ubc.ca/~haileynadine/assets/ECE.png"
          alt="ECE Logo"
          style={{ height: "50px" }}
        />
      </div>
      <div className={styles.container}>
        
        <Chat client={chatClient}>
          <div style={{ width: "25vw" }}>
            <ChannelList filters={filters} />
          </div>
          <Channel>
            <Window>
              <div style={{ width: "75vw", height: "60vh"}}>
                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between",}}>
                  <ChannelHeader />
                  <DeleteChannelButton />
                </div>
                <div
                  className="str-chat__channel str-chat__container"
                  style={{ overflowY: "hidden" }}
                >
                  <MessageList />
                  <MessageInput focus />
                </div>
                
              </div>
              
            </Window>
          </Channel>
        </Chat>
      </div>

      <div>
        <StreamVideo client={videoClient}>
          <StreamTheme>
            <div style={{ width: "0%" }}>
              <MyIncomingCallsUI />
            </div>
          </StreamTheme>
        </StreamVideo>
      </div>
    </div>
  );
};

const DeleteChannelButton = () => {
  const { channel } = useChannelStateContext();

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this channel? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await channel.delete();
      alert("Channel deleted successfully.");
    } catch (error) {
      console.error("Error deleting channel:", error);
      alert("Failed to delete the channel. Please try again.");
    }
  };

  return (
    <button
      style={{
        backgroundColor: "#ff4d4f",
        color: "white",
        border: "none",
        padding: "10px 15px",
        borderRadius: "5px",
        cursor: "pointer",
      }}
      onClick={handleDelete}
    >
      Delete Channel
    </button>
  );
};

const MyIncomingCallsUI = () => {
  const calls = useCalls();
  const [hasIncomingCalls, setHasIncomingCalls] = useState(false);

  useEffect(() => {
    try {
      const incomingCalls = calls.filter(
        (call) =>
          !call.isCreatedByMe &&
          call.state.callingState === CallingState.RINGING
      );
      setHasIncomingCalls(incomingCalls.length > 0);
    } catch (error) {
      console.error("Error filtering incoming calls:", error);
    }
  }, [calls]);

  if (!hasIncomingCalls) {
    return null;
  }

  return (
    <div>
      {calls
        .filter(
          (call) =>
            !call.isCreatedByMe &&
            call.state.callingState === CallingState.RINGING
        )
        .map((call) => (
          <StreamCall call={call} key={call.cid}>
            <MyIncomingCallUI call={call} />
          </StreamCall>
        ))}
    </div>
  );
};

const MyIncomingCallUI = ({ call }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState === CallingState.LEFT || callingState === CallingState.OFFLINE) {
    return null;
  }

  if (callingState === CallingState.RINGING) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
        }}
      >
        <RingingCall />
      </div>
    );
  }

  if (callingState === CallingState.JOINED) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          width: "100%",
          height: "100%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
        }}
      >
        <SpeakerLayout />
        <CallControls onLeave={() => call.endCall()} />
      </div>
    );
  }

  return null;
};

export default AdminSupport;
