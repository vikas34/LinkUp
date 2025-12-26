import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/post/feed", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setFeeds(data.posts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="w-full min-h-screen px-2 sm:px-4 py-6 flex flex-col xl:flex-row justify-center gap-6">
      
      {/* -------- Main Feed -------- */}
      <div className="w-full max-w-2xl">
        <StoriesBar />

        <div className="mt-4 space-y-5">
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      {/* -------- Right Sidebar (Desktop Only) -------- */}
      <div className="hidden xl:flex flex-col gap-6 w-80 sticky top-6 h-fit">
        <div className="bg-white text-xs p-4 rounded-md shadow">
          <h3 className="text-slate-800 font-semibold mb-2">Sponsored</h3>

          <img
            src={assets.sponsored_img}
            className="w-full h-40 object-cover rounded-md"
            alt="Sponsored"
          />

          <p className="text-slate-600 mt-2">Email Marketing</p>
          <p className="text-slate-400 mt-1">
            Supercharge your marketing with a powerful, easy-to-use platform.
          </p>
        </div>

        <RecentMessages />
      </div>
    </div>
  );
};

export default Feed;
