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
    // Extract userName from query parameters
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

          // Disconnect any existing user to prevent conflicts
          if (client) {
            await client.disconnectUser();
          }

          // Connect the new user
          await chatClient.connectUser(
            {
              id: userId,
              name: userName,
            },
            chatClient.devToken(userId) // Using development token for client-side only (not suitable for production)
          );

          setClient(chatClient);

          // Check if the channel already exists or create it
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

    // Generate a unique user ID
    setUserId(userName.trim().toLowerCase().replace(/\s+/g, "_"));
  };

  const initiateCall = () => {
    if (!userName.trim()) {
      alert("Please enter your name to initiate a call.");
      return;
    }

    // Navigate to RingAdminVideoCall with userName as a query parameter
    router.push(`/RingAdminVideoCall?userName=${encodeURIComponent(userName)}`);
  };

  if (!userId) {
    return (
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
        <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Welcome to Support Chat</h1>
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
            width: "100%",
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
      </div>
    );
  }

  if (!client || !channel) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "18px",
        }}
      >
        Connecting to Support Channel...
      </div>
    );
  }

  return (
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
              <MessageInput focus />
            </div>
          </Window>
          <Thread />
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
          }}
        >
          Call Admin
        </button>
      </div>
    </div>
  );
};

export default ClientSupport;
