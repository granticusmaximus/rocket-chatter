

import axios from "axios";

const API_BASE = "http://localhost:5000/api/calls";

export const createCall = async (callerId, receiverId, isGroup = false) => {
  const response = await axios.post(`${API_BASE}/create`, {
    callerId,
    receiverId,
    isGroup,
  });
  return response.data;
};

export const joinCall = async (callId, userId) => {
  const response = await axios.post(`${API_BASE}/${callId}/join`, { userId });
  return response.data;
};

export const leaveCall = async (callId, userId) => {
  const response = await axios.post(`${API_BASE}/${callId}/leave`, { userId });
  return response.data;
};

export const sendOffer = async (callId, offer) => {
  const response = await axios.post(`${API_BASE}/${callId}/offer`, { offer });
  return response.data;
};

export const sendAnswer = async (callId, answer) => {
  const response = await axios.post(`${API_BASE}/${callId}/answer`, { answer });
  return response.data;
};

export const sendIceCandidate = async (callId, candidate) => {
  const response = await axios.post(`${API_BASE}/${callId}/ice-candidate`, {
    candidate,
  });
  return response.data;
};

export const getCallById = async (callId) => {
  const response = await axios.get(`${API_BASE}/${callId}`);
  return response.data;
};