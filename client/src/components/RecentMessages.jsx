import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { getToken } = useAuth();
  const pollIntervalRef = useRef(null);
  const sseRef = useRef(null);
  const lastDataRef = useRef(null);

  const fetchRecentMessages = useCallback(async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/user/recent-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setMessages(
          data.messages.map((msg) => ({
            ...msg,
            displayTime: msg.created_at,
            
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // SSE Real-time connection
  useEffect(() => {
    if (!user?.id) return;

    const sseUrl = `/api/sse/${user.id}`;

    sseRef.current = new EventSource(sseUrl);

    sseRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        fetchRecentMessages(true);
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    };

    sseRef.current.onerror = () => {
      console.log("SSE connection error, retrying...");
      setTimeout(() => fetchRecentMessages(true), 1000);
    };

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, [user?.id, fetchRecentMessages]);

  // Polling as backup
  useEffect(() => {
    if (!user?.id) return;

    fetchRecentMessages();
    pollIntervalRef.current = setInterval(() => fetchRecentMessages(), 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user?.id, fetchRecentMessages]);

  const formatTime = (date) => {
    if (!date) return "Just now";

    const m = moment(date);
    const now = moment();

    if (now.isSame(m, "day")) return m.format("HH:mm");
    if (now.diff(m, "days") === 1) return `Yesterday ${m.format("HH:mm")}`;
    if (now.diff(m, "days") < 7) return m.format("ddd HH:mm");
    return m.format("MMM DD HH:mm");
  };

  if (loading && messages.length === 0) {
    return (
      <div className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow animate-pulse">
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>
      <div className="flex flex-col max-h-56 overflow-y-auto no-scrollbar">
        {messages.length > 0 ? (
          messages.map((message) => (
            <Link
              key={message.from_user_id?._id}
              to={`/message/${message.from_user_id?._id}`}
              className="flex items-start gap-2 py-2 hover:bg-slate-100 rounded transition-colors group"
            >
              <img
                src={
                  message.from_user_id?.profile_picture || "/default-avatar.png"
                }
                alt=""
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-slate-800 truncate max-w-[120px]">
                    {message.from_user_id?.full_name || "Unknown"}
                  </p>
                  <p className="text-[10px] text-slate-400 whitespace-nowrap ml-1">
                    {formatTime(message.displayTime)}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 truncate text-[13px] leading-tight max-w-[140px]">
                    {message.text?.length > 30
                      ? `${message.text.slice(0, 30)}...`
                      : message.text || "📷 Photo"}
                  </p>
                  {message.unseenCount > 0 && (
                    <div className="bg-indigo-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[11px] flex-shrink-0 ml-2 shadow-sm">
                      {message.unseenCount > 99 ? "99+" : message.unseenCount}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>No recent messages</p>
            <p className="text-xs mt-1 opacity-75">Start chatting!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentMessages;
