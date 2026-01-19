import envConfig from "@/config";
import { getAccessTokenFromLocalStorage } from "@/src/lib/utils";
import { io } from "socket.io-client";

const socket = io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
  autoConnect: false,
});

const connectWithToken = () => {
  const token = getAccessTokenFromLocalStorage();
  if (!token) return;
  socket.auth = {
    Authorization: `Bearer ${token}`,
  };
  if (!socket.connected) socket.connect();
};

if (typeof window !== "undefined") {
  // Try to connect immediately if token exists
  connectWithToken();

  // Re-connect when token changes in another tab or after login/refresh
  window.addEventListener("storage", (e) => {
    if (e.key === "accessToken") {
      connectWithToken();
    }
  });
}

export default socket;

// Debug handlers to help diagnose connection issues
if (typeof window !== "undefined") {
  socket.on("connect", () => {
    console.debug("[socket] connected", socket.id);
  });
  socket.on("disconnect", (reason) => {
    console.debug("[socket] disconnected", reason);
  });
  socket.on("connect_error", (err) => {
    console.error("[socket] connect_error:", err?.message ?? err);
  });
}
