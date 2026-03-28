import api from './axios';

export const getSlots = (pitchId, date) =>
  api.get('/slots', { params: { pitchId, date } });
