import React, { useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useUser, useAuth } from "@clerk/clerk-react";
import toast, { Toaster } from "react-hot-toast";

// Pages
import Login from "./pages/Login.jsx";
import Feed from "./pages/Feed.jsx";
import Messages from "./pages/Messages.jsx";
import ChatBox from "./pages/ChatBox.jsx";
import Connections from "./pages/Connections.jsx";
import Discover from "./pages/Discover.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import Profile from "./pages/Profile.jsx";
import Layout from "./pages/Layout.jsx";

// Redux slices
import { fetchUser } from "./features/user/userSlice.js";
import { fetchConnections } from "./features/connections/connectionsSlice.js";
import { addMessage } from "./features/messages/messagesSlice.js";

// Components
import Notification from "./components/Notification.jsx";

const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);

  /* -------------------- Fetch User & Connections -------------------- */
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const token = await getToken();
      dispatch(fetchUser(token));
      dispatch(fetchConnections(token));
    };

    fetchData();
  }, [user, getToken, dispatch]);

  /* -------------------- Track Current Path -------------------- */
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  /* -------------------- Server Sent Events (Messages) -------------------- */
  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(
      `${import.meta.env.VITE_BASEURL}/api/message/${user.id}`
    );

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (pathnameRef.current === `/message/${message.from_user_id._id}`) {
        dispatch(addMessage(message));
      } else {
        toast.custom((t) => <Notification t={t} message={message} />, {
          position: "bottom-right",
        });
      }
    };

    return () => eventSource.close();
  }, [user, dispatch]);

  /* -------------------- Routes -------------------- */
  return (
    <>
      <Toaster />

      <Routes>
        {/* If user is NOT logged in */}
        {!user ? (
          <Route path="/*" element={<Login />} />
        ) : (
          /* If user IS logged in */
          <Route path="/" element={<Layout />}>
            <Route index element={<Feed />} />
            <Route path="messages" element={<Messages />} />
            <Route path="message/:userId" element={<ChatBox />} />
            <Route path="connections" element={<Connections />} />
            <Route path="discover" element={<Discover />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:profileId" element={<Profile />} />
          </Route>
        )}
      </Routes>
    </>
  );
};

export default App;
