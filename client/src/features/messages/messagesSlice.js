import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ token, userId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/message/get",
        { to_user_id: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // ✅ Backend returns { success: true, messages: [] }
      // Return array directly for consistency
      return data.success ? data.messages || [] : [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    addMessage: (state, action) => {
      // ✅ Ensure single message object, not array
      if (action.payload && !Array.isArray(action.payload)) {
        state.messages = [...state.messages, action.payload];
      }
    },
    resetMessages: (state) => {
      state.messages = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch loading
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
     
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch messages";
        state.messages = [];
      });
  },
});

export const { setMessages, addMessage, resetMessages } = messagesSlice.actions;

export default messagesSlice.reducer;
