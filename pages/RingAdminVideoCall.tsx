import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { StreamChat } from "stream-chat";
import { CallPanel } from "./CallPanel";

const apiKey = "ye2nkek6ste4"; // Replace with your Stream API key
const adminUserId = "admin"; // Admin user ID

const RingAdminVideoCall = () => {
  const router = useRouter();
  const { userName } = router.query;
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (userName) {
      const userNameString = Array.isArray(userName) ? userName[0] : userName;
      const userId = userNameString.trim().toLowerCase().replace(/\s+/g, "_");

      const initStream = async () => {
        try {
          // Initialize Stream Chat client
          const chatClient = StreamChat.getInstance(apiKey);
          await chatClient.connectUser(
            { id: userId, name: userNameString },
            chatClient.devToken(userId)
          );

          // Initialize Stream Video client
          const videoClient = new StreamVideoClient({
            apiKey,
            user: { id: userId, name: userNameString },
            tokenProvider: async () => chatClient.devToken(userId),
          });

          setClient(videoClient);

          // Create or get a call specifically with admin
          const adminCall = videoClient.call("default", `call-${userId}-${adminUserId}`);
          const createdCall = await adminCall.getOrCreate({
            ring: true,
            data: {
              members: [
                { user_id: userId }, // Caller
                { user_id: adminUserId }, // Admin
              ],
            },
          });

          setCall(createdCall);
        } catch (error) {
          console.error("Error initializing Stream client or creating call:", error);
          setErrorMessage("Failed to initialize or create a call. Redirecting...");
          setTimeout(() => {
            router.push("/support");
          }, 3000);
        }
      };

      initStream();
      return () => {
        client?.disconnectUser();
        setClient(null);
      };
    }
  }, [userName]);

  if (errorMessage) {
    return <div style={{ color: "red" }}>{errorMessage}</div>;
  }

  if (!client || !call) {
    return <div>Initializing video call...</div>;
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallPanel />
      </StreamCall>
    </StreamVideo>
  );
};

export default RingAdminVideoCall;
