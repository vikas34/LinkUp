import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../features/user/userSlice.js";
import {useAuth} from '@clerk/clerk-react'
import toast from "react-hot-toast";

const ProfileModal = ({ setShowEdit }) => {

  const dispatch = useDispatch()
  const {getToken} = useAuth()
  const user = useSelector((state) => state.user.value);

  if (!user) return null;

  const [editForm, setEditForm] = useState({
    username: user.username || "",
    bio: user.bio || "",
    location: user.location || "",
    full_name: user.full_name || "",
    profile_picture: null,
    cover_photo: null,
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const userData = new FormData()
      const {full_name, username, bio, location, profile_picture, cover_photo} = editForm
       userData.append('username', username)
       userData.append('bio', bio)
       userData.append('location', location)
       userData.append('full_name', full_name)
       profile_picture && userData.append('profile', profile_picture)
       cover_photo && userData.append('cover', cover_photo )
      
      
      const token =await getToken()   
      dispatch(updateUser({userData, token}))
      setShowEdit(false);
    } catch (error) {
      toast.error(error.message)
    }
 
  
  };

  return (
    <div className="fixed inset-0 z-50 h-screen overflow-y-scroll bg-black/50">
      <div className="max-w-2xl sm:py-6 mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h1>

          <form className="space-y-4" onSubmit={e=> toast.promise(handleSaveProfile(e), {loading: 'Saving...'})}>

            {/* Profile picture */}
            <div className="flex flex-col items-start gap-3">
              <label
                htmlFor="profile_picture"
                className="block text-sm font-medium text-gray-700 cursor-pointer"
              >
                Profile Picture
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  id="profile_picture"
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      profile_picture: e.target.files[0],
                    })
                  }
                />

                <div className="relative group">
                  <img
                    src={
                      editForm.profile_picture
                        ? URL.createObjectURL(editForm.profile_picture)
                        : user.profile_picture
                    }
                    className="w-24 h-24 rounded-full object-cover mt-2"
                    alt=""
                  />
                  <div className="absolute inset-0 hidden group-hover:flex bg-black/20 rounded-full items-center justify-center">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                </div>
              </label>
            </div>

            {/* Cover photo */}
            <div className="flex flex-col items-start gap-3">
              <label
                htmlFor="cover_photo"
                className="block text-sm font-medium text-gray-700 cursor-pointer"
              >
                Cover Photo
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  id="cover_photo"
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      cover_photo: e.target.files[0],
                    })
                  }
                />

                <div className="relative group">
                  <img
                    src={
                      editForm.cover_photo
                        ? URL.createObjectURL(editForm.cover_photo)
                        : user.cover_photo
                    }
                    className="w-80 h-40 rounded-lg object-cover mt-2"
                    alt=""
                  />
                  <div className="absolute inset-0 hidden group-hover:flex bg-black/20 rounded-lg items-center justify-center">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                </div>
              </label>
            </div>

            {/* Inputs */}
            {["full_name", "username", "location"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.replace("_", " ").toUpperCase()}
                </label>
                <input
                  type="text"
                  value={editForm[field]}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  onChange={(e) =>
                    setEditForm({ ...editForm, [field]: e.target.value })
                  }
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                rows={3}
                value={editForm.bio}
                className="w-full p-3 border border-gray-200 rounded-lg"
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
