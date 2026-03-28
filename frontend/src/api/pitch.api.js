import api from './axios';

export const getPitches = () => api.get('/pitches');
