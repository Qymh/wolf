// eslint-disable-next-line no-unused-vars
import { Module, createStore } from 'vuex-pro';
import system from './modules/system';

const Index: Module = {
  modules: {
    system
  }
};

const store = createStore(Index);

export default store;
