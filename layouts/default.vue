<template>
  <v-app dark>
    <!-- <v-app-bar elevation="0" height="40px">
      
      <v-toolbar-title v-text="title" />
    </v-app-bar> -->
    <!-- <v-app-bar-nav-icon @click.stop="drawer = !drawer" /> -->
      <!-- <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn> -->
    <v-main class="main">
      <v-container class="default-container">
        <Nuxt />
      </v-container>

    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire',
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'HEGO',
    }
  },
}
</script>
<style>
.main {
  height: 100%;
}

.default-container{
  height: 95%;
}

.default-footer {
  height: 5%;
}
</style>
