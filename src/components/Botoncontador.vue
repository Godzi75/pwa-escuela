<script setup>
import { ref } from 'vue';

const contador = ref(0);
</script>

<template>
  <div >
    <button class="btn_warning" @click="contador++">HAZ DADO ESTA CANTIDAD DE CLICKS AL BOTON{{ contador }}</button>
    
    {{ message }}<!-- llamando una variable -->
  </div>

</template>

<sytle scoped>


</sytle>
