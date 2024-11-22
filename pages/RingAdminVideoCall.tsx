import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    Call,
    StreamCall,
    StreamTheme,
    StreamVideo,
    SpeakerLayout,
    CallControls,
    StreamVideoClient,
    CallingState,
    useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { StreamChat } from "stream-chat";

const apiKey = "ye2nkek6ste4"; // Replace with your Stream API key
const adminUserId = "admin"; // Admin user ID for the call

// Placeholder components for different call states
const IncomingCallScreen = () => <div>Incoming call...</div>;
const LoadingCallScreen = () => <div>Joining call...</div>;
const HaveANiceDayScreen = () => <div>Thank you for using our service. Have a nice day!</div>;
const RestoringConnectionScreen = () => <div>Restoring connection...</div>;
const GeneralConnectionErrorScreen = () => <div>Connection error. Please try again later.</div>;
const NoConnectionScreen = () => <div>No connection detected. Please check your internet.</div>;
const ErrorNotification = ({ message }: { message: string }) => (
    <div style={{ color: "red", textAlign: "center", padding: "20px" }}>{message}</div>
);

const RingAdminVideoCall = () => {
    const router = useRouter();
    const { userName } = router.query; // Extract userName from query parameters

    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<Call | null>(null);
    const [userId, setUserId] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        if (userName) {
            // Ensure userName is treated as a string
            const userNameString = Array.isArray(userName) ? userName[0] : userName;
            const userIdGenerated = userNameString.trim().toLowerCase().replace(/\s+/g, "_");
            setUserId(userIdGenerated);

            const initStream = async () => {
                try {
                    // Initialize Stream Chat client
                    const chatClient = StreamChat.getInstance(apiKey);
                    await chatClient.connectUser(
                        {
                            id: userIdGenerated,
                            name: userNameString,
                        },
                        chatClient.devToken(userIdGenerated)
                    );

                    // Initialize Stream Video client
                    const videoClient = new StreamVideoClient({
                        apiKey,
                        user: { id: userIdGenerated, name: userNameString },
                        tokenProvider: () => chatClient.devToken(userIdGenerated),
                    });

                    setClient(videoClient);
                } catch (error) {
                    console.error("Error initializing Stream client:", error);
                    setErrorMessage("Failed to initialize the video call. Redirecting to support page.");
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
    }, [userName]);

    const initiateCall = () => {
        if (!client) return;

        const callId = `call-${userId}-${adminUserId}`;
        const myCall = client.call("default", callId);

        myCall
            .getOrCreate({
                ring: true,
                data: {
                    members: [
                        { user_id: userId }, // Caller
                        { user_id: adminUserId }, // Admin
                    ],
                },
            })
            .then(() => {
                setCall(myCall);

                // Set a timeout to leave the call after 30 seconds if not picked up
                const timeout = setTimeout(() => {
                    if (myCall.state.callingState !== "joined") {
                        myCall.leave();
                        setCall(null);
                        setErrorMessage("Call timed out as the admin did not pick up. Redirecting to support page.");
                        setTimeout(() => {
                            router.push({ pathname: "/support", query: { userName } });
                        }, 3000);
                    }
                }, 30000); // 30 seconds

                // Clear timeout if the admin picks up
                myCall.on("call.joined", () => clearTimeout(timeout));
            })
            .catch((err) => {
                console.error("Failed to initiate the call", err);
                setErrorMessage("Failed to initiate the call. Please try again.");
            });
    };

    const handleLeaveCall = async () => {
        if (call) {
            try {
                await call.leave();
                setCall(null);
                setErrorMessage("You have left the call. Redirecting to support page.");
                setTimeout(() => {
                    router.push({ pathname: "/support", query: { userName } });
                }, 3000);
            } catch (error) {
                console.error("Error leaving the call:", error);
                setErrorMessage("Failed to leave the call. Redirecting to support page.");
                setTimeout(() => {
                    router.push({ pathname: "/support", query: { userName } });
                }, 3000);
            }
        } else {
            setErrorMessage("No ongoing call to leave. Redirecting to support page.");
            setTimeout(() => {
                router.push({ pathname: "/support", query: { userName } });
            }, 3000);
        }
    };

    // Render different screens based on whether the client is initialized or not
    if (errorMessage) {
        return <ErrorNotification message={errorMessage} />;
    }

    if (!client) {
        return (
            <div
                style={{
                    textAlign: "center",
                    padding: "20px",
                    fontSize: "18px",
                }}
            >
                Initializing video call...
            </div>
        );
    }

    if (!call) {
        return (
            <div
                style={{
                    textAlign: "center",
                    padding: "20px",
                }}
            >
                <h1>Welcome, {userName}!</h1>
                <button
                    onClick={initiateCall}
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
                    Ring Admin
                </button>
            </div>
        );
    }

    return (
        <StreamVideo client={client}>
            <StreamTheme>
                <StreamCall call={call}>
                    <CallStateRenderer call={call} onLeave={handleLeaveCall} />
                </StreamCall>
            </StreamTheme>
        </StreamVideo>
    );
};

// Separate component for rendering based on call state
const CallStateRenderer = ({ call, onLeave }: { call: Call; onLeave: () => void }) => {
    const router = useRouter();
    const { userName } = router.query; // Extract userName from query parameters

    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();
    switch (callingState) {
        case CallingState.UNKNOWN:
        case CallingState.IDLE:
        case CallingState.RINGING:
            return <IncomingCallScreen />;
        case CallingState.JOINING:
            return <LoadingCallScreen />;
        case CallingState.JOINED:
            return (
                <div>
                    <SpeakerLayout />
                    <CallControls />
                </div>
            );
        case CallingState.LEFT:
            setTimeout(() => {
                router.push({ pathname: "/support", query: { userName } });
            }, 3000);
            return (
                <div>
                    <HaveANiceDayScreen />
                    <ErrorNotification message="You have left the call. Redirecting to support page." />
                </div>
            );
        case CallingState.RECONNECTING:
        case CallingState.MIGRATING:
            return <RestoringConnectionScreen />;
        case CallingState.RECONNECTING_FAILED:
            return <GeneralConnectionErrorScreen />;
        case CallingState.OFFLINE:
            return <NoConnectionScreen />;
        default:
            const exhaustiveCheck: never = callingState;
            throw new Error(`Unknown calling state: ${exhaustiveCheck}`);
    }
};

export default RingAdminVideoCall;
