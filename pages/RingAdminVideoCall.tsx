import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    Call,
    StreamCall,
    StreamTheme,
    StreamVideo,
    SpeakerLayout,
    CallControls,
    RingingCall,
    StreamVideoClient,
    CallingState,
    useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { StreamChat } from "stream-chat";

const apiKey = "ye2nkek6ste4"; // Replace with your Stream API key
const adminUserId = "admin"; // Admin user ID for the call

interface ErrorNotificationProps {
    message: string;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message }) => (
    <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
        {message}
    </div>
);

interface CallStateHandlerProps {
    call: Call;
}

const IncomingCallScreen = () => <div>Incoming call...</div>;
const HaveANiceDayScreen = () => <div>Thank you for using our service. Have a nice day!</div>;
const RestoringConnectionScreen = () => <div>Restoring connection...</div>;

const CallStateHandler: React.FC<CallStateHandlerProps> = ({ call }) => {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();
    const router = useRouter();
    const { userName } = router.query;

    useEffect(() => {
        if (callingState === CallingState.LEFT) {
            router.push({ pathname: "/support", query: { userName } });
        }
    }, [callingState, router, userName]);

    switch (callingState) {
        case CallingState.RINGING:
            return (
                <StreamCall call={call}>
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
                </StreamCall>
            );
        case CallingState.JOINED:
            return (
                <div>
                    <SpeakerLayout />
                    <CallControls />
                </div>
            );
        case CallingState.RECONNECTING:
            return <RestoringConnectionScreen />;
        default:
            return <div>Loading...</div>;
    }
};

const RingAdminVideoCall: React.FC = () => {
    const router = useRouter();
    const { userName } = router.query;

    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<Call | null>(null);
    const [userId, setUserId] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        if (userName) {
            const userNameString = Array.isArray(userName) ? userName[0] : userName;
            const userIdGenerated = userNameString.trim().toLowerCase().replace(/\s+/g, "_");
            setUserId(userIdGenerated);

            const initStream = async () => {
                try {
                    const chatClient = StreamChat.getInstance(apiKey);
                    await chatClient.connectUser(
                        {
                            id: userIdGenerated,
                            name: userNameString,
                        },
                        chatClient.devToken(userIdGenerated)
                    );

                    const videoClient = new StreamVideoClient({
                        apiKey,
                        user: { id: userIdGenerated, name: userNameString },
                        tokenProvider: () => chatClient.devToken(userIdGenerated),
                    });

                    setClient(videoClient);
                } catch (error) {
                    console.error("Error initializing Stream client:", error);
                    setErrorMessage("Failed to initialize the video call.");
                    setTimeout(() => {
                        router.push({ pathname: "/support", query: { userName } });
                    }, 3000);
                }
            };

            initStream();

            return () => {
                client?.disconnectUser();
                setClient(null);
            };
        }
    }, [userName, router]);

    useEffect(() => {
        if (client && userId) {
            const initiateCall = async () => {
                const callId = `call-${userId}-${adminUserId}`;
                const myCall = client.call("default", callId);

                try {
                    await myCall.getOrCreate({
                        ring: true,
                        data: {
                            members: [
                                { user_id: userId },
                                { user_id: adminUserId },
                            ],
                        },
                    });
                    setCall(myCall);
                } catch (err) {
                    console.error("Failed to initiate the call", err);
                    setErrorMessage("Failed to initiate the call. Please try again.");
                }
            };

            initiateCall();
        }
    }, [client, userId]);

    if (errorMessage) {
        return (
            <div>
                <ErrorNotification message={errorMessage} />
                <button onClick={() => router.push("/support")}>Return to Support</button>
            </div>
        );
    }

    if (!client) {
        return <div>Initializing video call...</div>;
    }

    if (!call) {
        return <div>Setting up the call...</div>;
    }

    return (

        <StreamVideo client={client}>
            <StreamTheme>
                <StreamCall call={call}>
                    <CallStateHandler call={call} />
                </StreamCall>
            </StreamTheme>
        </StreamVideo>
    );
};

export default RingAdminVideoCall;
