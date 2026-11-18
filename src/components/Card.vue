<script setup>
defineProps({
  titulo: String
});
const emitir = defineEmits(['limpiar']);

import { ref, computed, watch, nextTick} from 'vue';

const CLAVE_TAREAS='misTareas';
const nuevaTarea = ref('');
const tareas = ref(cargarTareas());
const filtro = ref('todas');

const cancionesExistentes = ref([])
const buscarCancion = ref('')
const cargandoCancion = ref(false)
const errorCancion = ref('')
const clienteId = 'f4afe559'



watch(tareas, (nuevaTarea) => {
  localStorage.setItem('misTareas',
  JSON.stringify(nuevaTarea));
}, {
  deep:true

})
// recuperar tareas previamente almacenadas
function cargarTareas(){
  const DatosGuardados = localStorage.getItem('misTareas');
  if(DatosGuardados) {
    return JSON.parse(DatosGuardados);
  }
  return[];
}

const tareasExistentes = ref([]);
const cargando = ref(false);
const error = ref('');

function importarTareas(){
  const tareasConvertidas = tareasExistentes.value.map(
  tarea => ({
    id:crypto.randomUUID(),
    titulo: tarea.title,
    estado: tarea.completed
  })
)
  tareas.value.push(...tareasConvertidas)
}
const tareaEditando = ref(null);
const tituloEditado = ref('');


const mostrarAlerta = ref(false);
const mensajeAlerta = ref('');

const eliminarAlerta = ref(false);
const mensajeElimnar = ref('');

const editarAlerta = ref(false);
const mensajeEditar = ref('');



const tareasFiltradas = computed(() => {
  if(filtro.value === 'pendientes'){
    return tareas.value.filter(
      t => !t.completada
    );
  }
  if(filtro.value === 'completada'){
    return tareas.value.filter(
      t => t.completada
    );
  }
  return tareas.value;
})

const totalPendientes = computed (() => {
  tareas.value.filter(t => !t.completada).length;
  
})

const totalCompletadas = computed (() => {
  tareas.value.filter(t => t.completada).length;
}
)

function agregarTarea(){
  const titulo = nuevaTarea.value.trim();
  if (titulo === ''){
    return
  }
  const tarea = {
    id: crypto.randomUUID(),
    titulo: titulo,
    completada: false,
  }
// Es clave valor esta funcion
 localStorage.setItem(
  'misTareas',JSON.stringify(tareas.value)
 );
  tareas.value.push(tarea)
  nuevaTarea.value = ''
  console.table(tareas.value);
  mensajeAlerta.value = 'Tarea agregada correctamente';
  mostrarAlerta.value= true;
  
}
function cambiarEstado(id){
  const tarea = tareas.value.find(t =>
  t.id === id);
  if (tarea){
    tarea.completada = !tarea.completada
    console.table(tareas.value);
  }

 
} 

function eliminarTodas(){
  if(tareas.value.length === 0){
    return;

  }

  tareas.value=[];
}
function contarCompletadas() {
  return tareas.value.filter(tarea => tarea.completada).length;
}
function eliminar(id){
  tareas.value = tareas.value.filter(tarea => tarea.id !== id)
  mensajeElimnar.value='La tarea se elimino correctamente';
  eliminarAlerta.value = true;
}
function editarTarea(tarea) {
  tareaEditando.value = tarea.id;
  tituloEditado.value = tarea.titulo;
}

function guardarEdicion(id) {
  const titulo = tituloEditado.value.trim();

  if (titulo === '') {
    return;

  }

  const tarea = tareas.value.find(t => t.id === id);

  if (tarea) {
    tarea.titulo = titulo;
    mensajeEditar.value='La tarea se edito correctamente';
    editarAlerta.value = true;

  }

  tareaEditando.value = null;
  tituloEditado.value = '';
}

function cancelarEdicion() {
  tareaEditando.value = null;
  tituloEditado.value = '';
}

async function obtenerDatos(){
  cargando.value = true;
  error.value = '';
  try{
      const respuesta = await fetch(
    'https://jsonplaceholder.typicode.com/todos?_limit=5');


    const datos = await respuesta.json();
    tareasExistentes.value=datos;
    console.table(datos);

  } catch (err) {
    error.value = 'No fue posible recuperar las tareas';
    console.error(err)

  } finally {
    cargando.value = false
  }


}


async function obtenerCanciones() {
  const consulta = buscarCancion.value.trim();

  if (!consulta) {
    errorCancion.value = 'Escribe el nombre de una canción o artista';
    return;
  }

  cargandoCancion.value = true;
  errorCancion.value = '';
  cancionesExistentes.value = [];

  try {
    const parametros = new URLSearchParams({
      client_id: clienteId,
      format: 'json',
      search: consulta,
      limit: '10',
      include: 'licenses',
      audioformat: 'mp32'
    });

    const respuesta = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?${parametros}`
    );

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    if (datos.headers?.status !== 'success') {
      throw new Error(
        datos.headers?.error_message || 'Error de Jamendo'
      );
    }

    cancionesExistentes.value = datos.results
      .filter(cancion => {
        const licencia = cancion.license_ccurl || '';

        return /creativecommons\.org\/licenses\/by(-sa)?\//.test(licencia);
      });

    if (cancionesExistentes.value.length === 0) {
      errorCancion.value =
        'No se encontraron canciones con licencia CC BY o CC BY-SA.';
    }

    console.table(cancionesExistentes.value);

  } catch (err) {
    console.error('Error de Jamendo:', err);

    errorCancion.value =
      'No fue posible recuperar las canciones. Revisa tu conexión o tu Client ID.';

  } finally {
    cargandoCancion.value = false;
  }
}


</script>


<template>
  <main class="min-h-screen w-full bg-slate-100 px-4 py-8 sm:px-6">

    <div class="mx-auto w-full max-w-5xl space-y-6">

      <!-- ENCABEZADO -->
      <header class="rounded-2xl bg-gradient-to-r from-green-800 to-emerald-600 p-6 text-center text-white shadow-lg">
        <h1 class="text-3xl font-bold">
          Formulario de tareas
        </h1>

        <p class="mt-2 text-sm text-green-100">
          Organiza tus actividades y mantén todo bajo control.
        </p>
      </header>


      <!-- SECCIÓN PRINCIPAL DE TAREAS -->
      <section class="rounded-2xl bg-white p-5 shadow-lg sm:p-6">

        <!-- FILTROS -->
        <div class="flex flex-wrap justify-center gap-2 py-3">

          <button
            v-for="opcion in [
              { valor: 'todas', texto: 'Todas' },
              { valor: 'pendientes', texto: 'Pendientes' },
              { valor: 'completada', texto: 'Completadas' }
            ]"
            :key="opcion.valor"
            @click="filtro = opcion.valor"
            :class="[
              'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 border',
              'focus:outline-none focus:ring-2 focus:ring-green-300',
              filtro === opcion.valor
                ? 'bg-green-600 text-white border-green-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-green-50 hover:text-green-700'
            ]"
          >
            {{ opcion.texto }}
          </button>

        </div>


        <!-- ALERTAS -->
        <div class="space-y-3">

          <!-- ALERTA AGREGAR -->
          <div
            v-if="mostrarAlerta"
            class="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 shadow-sm"
            role="alert"
          >
            <span>✓</span>

            <p class="flex-1">
              <span class="font-semibold">Agregada con éxito</span>
              {{ mensajeAlerta }}
            </p>

            <button
              type="button"
              @click="mostrarAlerta = false"
              aria-label="Cerrar alerta"
              class="font-bold"
            >
              ✕
            </button>
          </div>


          <!-- ALERTA ELIMINAR -->
          <div
            v-if="eliminarAlerta"
            class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm"
            role="alert"
          >
            <span>🗑</span>

            <p class="flex-1">
              <span class="font-semibold">Eliminada con éxito</span>
              {{ mensajeElimnar }}
            </p>

            <button
              type="button"
              @click="eliminarAlerta = false"
              aria-label="Cerrar alerta"
              class="font-bold"
            >
              ✕
            </button>
          </div>


          <!-- ALERTA EDITAR -->
          <div
            v-if="editarAlerta"
            class="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800 shadow-sm"
            role="alert"
          >
            <span>✓</span>

            <p class="flex-1">
              <span class="font-semibold">Editada con éxito</span>
              {{ mensajeEditar }}
            </p>

            <button
              type="button"
              @click="editarAlerta = false"
              aria-label="Cerrar alerta"
              class="font-bold"
            >
              ✕
            </button>
          </div>

        </div>


        <!-- CONTADOR -->
        <div class="my-6 text-center">
          <h2 class="text-sm font-semibold text-gray-600">
            Tareas completadas: {{ contarCompletadas() }}
          </h2>
        </div>


        <!-- MENSAJE SIN TAREAS -->
        <p
          v-if="tareas.length === 0"
          class="py-6 text-center text-sm text-gray-400"
        >
          No tienes tareas registradas
        </p>


        <!-- LISTA DE TAREAS -->
        <ul class="space-y-3">

          <li
            v-for="tarea in tareasFiltradas"
            :key="tarea.id"
            class="flex min-w-0 items-center gap-2 rounded-xl border border-gray-100 bg-slate-50 p-3 transition hover:shadow-sm"
          >

            <!-- CHECKBOX -->
            <input
              type="checkbox"
              :checked="tarea.completada"
              @change="cambiarEstado(tarea.id)"
              :class="tarea.completada
                ? 'accent-green-500'
                : 'accent-red-500'"
              class="h-5 w-5 shrink-0 cursor-pointer"
            />


            <!-- TÍTULO -->
            <span
              v-if="tareaEditando !== tarea.id"
              :class="{ 'line-through text-gray-400': tarea.completada }"
              class="min-w-0 flex-1 break-words text-base font-medium text-gray-700"
            >
              {{ tarea.titulo }}
            </span>


            <!-- EDITAR TEXTO -->
            <input
              v-else
              v-model="tituloEditado"
              @keyup.enter="guardarEdicion(tarea.id)"
              @keyup.esc="cancelarEdicion"
              class="min-w-0 flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm"
              type="text"
              autofocus
            />


            <!-- GUARDAR -->
            <button
              v-if="tareaEditando === tarea.id"
              type="button"
              @click="guardarEdicion(tarea.id)"
              class="shrink-0 rounded-lg bg-green-500 p-2 text-white hover:bg-green-700"
              aria-label="Guardar tarea"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
              </svg>
            </button>


            <!-- CANCELAR -->
            <button
              v-if="tareaEditando === tarea.id"
              type="button"
              @click="cancelarEdicion"
              class="shrink-0 rounded-lg bg-gray-500 p-2 text-white hover:bg-gray-700"
              aria-label="Cancelar edición"
            >
              ✕
            </button>


            <!-- EDITAR -->
            <button
              v-else
              type="button"
              @click="editarTarea(tarea)"
              class="shrink-0 rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-700"
              aria-label="Editar tarea"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/>
              </svg>
            </button>


            <!-- ELIMINAR -->
            <button
              type="button"
              @click="eliminar(tarea.id)"
              class="shrink-0 rounded-lg bg-red-500 p-2 text-white hover:bg-red-700"
              aria-label="Eliminar tarea"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79"/>
              </svg>
            </button>

          </li>

        </ul>


        <!-- FORMULARIO AGREGAR -->
        <form
          @submit.prevent="agregarTarea"
          class="mt-6 flex flex-col gap-3 sm:flex-row"
        >

          <input
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            type="text"
            v-model="nuevaTarea"
            placeholder="Ingresa tu tarea pendiente"
          />

          <button
            type="submit"
            class="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-green-700 hover:-translate-y-1"
          >
            + Crear Tarea
          </button>

        </form>


        <!-- ELIMINAR TODAS -->
        <div class="mt-5 flex justify-center">

          <button
            @click="eliminarTodas"
            type="button"
            class="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-red-700 hover:-translate-y-1"
          >
            🗑 Eliminar todo
          </button>

        </div>

      </section>


      <!-- SECCIÓN API -->
      <section class="rounded-2xl bg-white p-5 shadow-lg sm:p-6">

        <div class="mb-5 text-center">
          <h2 class="text-xl font-bold text-gray-800">
            📡 Gestión de datos
          </h2>

          <p class="mt-1 text-sm text-gray-500">
            Consulta e importa tareas desde la API.
          </p>
        </div>


        <!-- TAREAS EXISTENTES -->
        <div class="rounded-xl border border-gray-100 bg-slate-50 p-4">

          <h3 class="mb-4 text-center font-semibold text-gray-700">
            Tareas existentes
          </h3>

          <ul class="space-y-3">

            <li
              v-for="tarea in tareasExistentes"
              :key="tarea.id"
              class="flex items-center justify-between gap-3 rounded-lg bg-white p-3 shadow-sm"
            >

              <span class="min-w-0 break-words text-sm font-medium text-gray-700">
                {{ tarea.title }}
              </span>

              <span
                v-if="tarea.completed"
                class="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
              >
                Completada
              </span>

              <span
                v-else
                class="shrink-0 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700"
              >
                Pendiente
              </span>

            </li>

          </ul>

          <p
            v-if="tareasExistentes.length === 0"
            class="py-4 text-center text-sm text-gray-400"
          >
            No hay tareas cargadas desde la API.
          </p>

        </div>


        <!-- BOTONES API -->
        <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <button
            type="button"
            @click="obtenerDatos()"
            :disabled="cargando"
            class="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 font-semibold text-white shadow-md transition hover:from-green-600 hover:to-emerald-700 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z"/>
            </svg>

            {{ cargando ? 'Consultando API...' : 'Consultar API' }}

          </button>


          <button
            type="button"
            @click="importarTareas()"
            :disabled="tareasExistentes.length === 0"
            class="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-indigo-700 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>

            Importar tareas

          </button>

        </div>

      </section>


    

  <!-- SECCIÓN MÚSICA -->
      <section class="rounded-2xl bg-white p-5 shadow-lg sm:p-6">

        <div class="mb-6 text-center">

          <h2 class="text-2xl font-bold text-gray-800">
            🎵 Buscador de música
          </h2>

          <p class="mt-2 text-sm text-gray-500">
            Encuentra tus canciones y artistas favoritos.
          </p>

        </div>


        <!-- BUSCADOR -->
        <div class="mx-auto max-w-2xl space-y-3">

          <input
            v-model="buscarCancion"
            @keyup.enter="obtenerCanciones"
            type="text"
            placeholder="Busca una canción o artista..."
            class="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />


          <button
            type="button"
            @click="obtenerCanciones"
            :disabled="cargandoCancion || !buscarCancion.trim()"
            class="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{
              cargandoCancion
                ? 'Buscando canciones...'
                : '🔍 Buscar música'
            }}
          </button>


          <!-- ERROR -->
          <p
            v-if="errorCancion"
            class="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600"
          >
            {{ errorCancion }}
          </p>

        </div>


        <!-- RESULTADOS MUSICALES -->
        <ul class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <li
            v-for="cancion in cancionesExistentes"
            :key="cancion.id"
            class="rounded-xl border border-gray-200 bg-slate-50 p-4 shadow-sm transition hover:shadow-md"
          >

            <!-- INFORMACIÓN -->
            <div class="flex items-center gap-3">

              <img
                :src="cancion.image"
                :alt="cancion.name"
                class="h-16 w-16 shrink-0 rounded-xl object-cover shadow-sm"
              />

              <div class="min-w-0 flex-1">

                <p class="break-words font-bold text-gray-800">
                  {{ cancion.name }}
                </p>

                <p class="text-sm text-gray-500">
                  {{ cancion.artist_name }}
                </p>

                <p class="mt-1 text-xs text-gray-400">
                  Duración:
                  {{ Math.floor(cancion.duration / 60) }}:{{
                    String(cancion.duration % 60).padStart(2, '0')
                  }}
                </p>

              </div>

            </div>


            <!-- REPRODUCTOR -->
            <audio
              v-if="cancion.audio"
              :src="cancion.audio"
              controls
              preload="none"
              class="mt-4 w-full"
            ></audio>


            <!-- ENLACES -->
            <div class="mt-4 flex flex-col gap-2">

              <a
                :href="cancion.shareurl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm font-medium text-blue-600 underline hover:text-blue-800"
              >
                🎧 Escuchar en Jamendo
              </a>

              <a
                :href="cancion.license_ccurl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-gray-500 underline hover:text-gray-700"
              >
                Consultar licencia
              </a>

            </div>

          </li>

        </ul>

        <p
          v-if="cancionesExistentes.length === 0 && !cargandoCancion && !errorCancion"
          class="mt-6 text-center text-sm text-gray-400"
        >
          Busca una canción para mostrar los resultados.
        </p>

      </section>


    </div>

  </main>
</template>
