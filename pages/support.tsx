import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  Window,
  Thread,
  MessageList,
  MessageInput,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

const apiKey = "ye2nkek6ste4"; // Replace with your Stream API key

const ClientSupport = () => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [channel, setChannel] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const { userName: queryUserName } = router.query;
    if (queryUserName && typeof queryUserName === "string") {
      setUserName(queryUserName);
      setUserId(queryUserName.trim().toLowerCase().replace(/\s+/g, "_"));
    }
  }, [router.query]);

  useEffect(() => {
    if (userId && userName) {
      const initStream = async () => {
        try {
          const chatClient = StreamChat.getInstance(apiKey);

          if (client) {
            await client.disconnectUser();
          }

          await chatClient.connectUser(
            {
              id: userId,
              name: userName,
            },
            chatClient.devToken(userId)
          );

          setClient(chatClient);

          const existingChannel = chatClient.channel("messaging", `support_${userId}`, {
            members: [userId, "admin"],
          });
          await existingChannel.watch();
          setChannel(existingChannel);
        } catch (error) {
          console.error("Error connecting to Stream:", error);
        }
      };

      initStream();

      return () => {
        client?.disconnectUser();
      };
    }
  }, [userId, userName]);

  const startSession = () => {
    if (!userName.trim()) {
      alert("Please enter your name to start the chat.");
      return;
    }

    setUserId(userName.trim().toLowerCase().replace(/\s+/g, "_"));
  };

  const initiateCall = () => {
    if (!userName.trim()) {
      alert("Please enter your name to initiate a call.");
      return;
    }

    router.push(`/RingAdminVideoCall?userName=${encodeURIComponent(userName)}`);
  };

  const goBack = () => {
    router.push("/");
  };

  return (
    <div style={{overflowX: "hidden"}}>
      {/* Top Banner */}
      <div
        className="top-banner-container"
        style={{
          display: "flex",
          margin: "0 auto",
          maxWidth: "800px",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px",
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

      {!userId ? (
        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            padding: "20px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
            Welcome to Support Chat
          </h1>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{
              padding: "10px",
              marginBottom: "20px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
          <button
            onClick={startSession}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Start Chat
          </button>
          <button
            onClick={goBack}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              marginTop: "10px",
            }}
          >
            Back to Home
          </button>
        </div>
      ) : !client || !channel ? (
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "18px",
          }}
        >
          Connecting to Support Channel...
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            padding: "20px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Chat client={client} theme="team light">
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <div
                  className="str-chat__channel str-chat__container"
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflowY: "hidden",
                  }}
                >
                  <MessageList />
                  <MessageInput focus audioRecordingEnabled={true}/>
                </div>
              </Window>
            </Channel>
          </Chat>
          <div
            style={{
              marginTop: "10px",
              textAlign: "center",
            }}
          >
            <button
              onClick={initiateCall}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                marginRight: "10px",
              }}
            >
              Call Admin
            </button>
            <button
              onClick={goBack}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSupport;
