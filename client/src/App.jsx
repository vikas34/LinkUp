import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Feed from "./pages/Feed.jsx";
import Messages from "./pages/Messages.jsx";
import ChatBox from "./pages/ChatBox.jsx";
import Connections from "./pages/Connections.jsx";
import Discover from "./pages/Discover.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import Profile from "./pages/Profile.jsx";
import Layout from "./pages/Layout.jsx";
import { useUser, useAuth } from "@clerk/clerk-react";
import {Toaster} from 'react-hot-toast'
import { useEffect } from "react";

const App = () => {
  const { user } = useUser();
  const {getToken} = useAuth()

  useEffect(() => {
    if(user){
      getToken().then((token)=>console.log(token))
    }

  },[user])

  return (
    <>
    <Toaster/>
    <Routes>
      {/* If user is not logged in → Login page */}
      {!user ? (
        <Route path="/*" element={<Login />} />
      ) : (
        // If user is logged in → Layout wraps all main routes
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
