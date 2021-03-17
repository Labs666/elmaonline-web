/* eslint-disable no-param-reassign */
import { action, thunk } from 'easy-peasy';
import { Replays, BattleListPeriod } from 'api';

export default {
  replays: null,
  setReplays: action((state, payload) => {
    state.replays = payload;
  }),
  getReplays: thunk(async (actions, payload) => {
    const get = await Replays(payload);
    if (get.ok) {
      actions.setReplays(get.data);
    }
  }),
  battles: null,
  setBattles: action((state, payload) => {
    state.battles = payload;
  }),
  getBattles: thunk(async (actions, payload) => {
    const get = await BattleListPeriod(payload);
    if (get.ok) {
      actions.setBattles(get.data);
    }
  }),
};
