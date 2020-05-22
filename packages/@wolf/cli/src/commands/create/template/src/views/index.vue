<template>
  <div>{{ state.system }}</div>
</template>

<script>
import { useState } from 'vuex-pro';
export default {
  name: 'Index',
  setup() {
    const state = useState('system', ['system']);
    return {
      state
    };
  }
};
</script>

<style lang="scss" scoped></style>
