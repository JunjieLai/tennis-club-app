import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Members API
export const getAllMembers = () => API.get('/members');
export const getMemberById = (id) => API.get(`/members/${id}`);
export const getMemberStats = (id) => API.get(`/members/${id}/stats`);
export const getBestChallengers = (id) => API.get(`/members/${id}/challengers`);
export const getTopPlayers = (limit = 5) => API.get(`/members/top/${limit}`);
export const getMemberAnalytics = () => API.get('/members/analytics/stats');

// Challenges API
export const getMyChallenges = () => API.get('/challenges/me');
export const createChallenge = (data) => API.post('/challenges', data);
export const acceptChallenge = (id) => API.put(`/challenges/${id}/accept`);
export const rejectChallenge = (id) => API.put(`/challenges/${id}/reject`);
export const getAcceptedChallenges = () => API.get('/challenges/accepted');

// Matches API
export const getAllMatches = () => API.get('/matches');
export const getMatchById = (id) => API.get(`/matches/${id}`);
export const getMemberMatches = (id) => API.get(`/matches/member/${id}`);
export const createMatch = (data) => API.post('/matches', data);
export const updateMatch = (id, data) => API.put(`/matches/${id}`, data);
export const deleteMatch = (id) => API.delete(`/matches/${id}`);

export default API;
