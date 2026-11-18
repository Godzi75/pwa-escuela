<script setup>
import Card from './components/Card.vue';
import{onUpdated, ref} from 'vue';
const titulo = ref ("Mi titulo");
function limpiartitulo(){
  titulo.value='';
}


</script>   <!-- logica codigo -->


<template  >    <!-- elementos HTML que componen el componente -->
<main class="flex justify-center gap-4">
  
  <Card   :titulo="titulo" @limpiar="limpiartitulo"/>


</main>

</template>

