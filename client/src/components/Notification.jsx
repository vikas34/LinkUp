import React from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addMessage } from "../features/messages/messagesSlice.js";

const Notification = ({ t, message }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleReply = () => {
    dispatch(addMessage(message));
    toast.dismiss(t.id);
    setTimeout(() => {
      navigate(`/message/${message.from_user_id._id}`);
    }, 100);
  };

  return (
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg flex border border-gray-300 hover:scale-105 transition cursor-pointer">
      <div 
        className="flex-1 p-4" 
        onClick={() => toast.dismiss(t.id)}
      >
        <div className="flex items-start">
          <img
            src={message.from_user_id.profile_picture}
            className="h-10 w-10 rounded-full flex-shrink-0 mt-0.5"
          />
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {message.from_user_id.full_name}
            </p>
            <p className="text-sm text-gray-500">
              {message.text.slice(0, 50)}...
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleReply();
        }}
        className="p-4 text-indigo-600 font-semibold hover:text-indigo-800 border-l border-gray-200"
      >
        Reply →
      </button>
    </div>
  );
};


export default Notification;
