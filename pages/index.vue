<template>
  <div>
    <div class="search">
      <div>
        <img
          class="search-img"
          src="../assets/img/hego-search.png"
          alt="HEGO-Logo"
        />
      </div>
    </div>
    <SearchForm />
    <v-footer absolute class="font-weight-medium" color="white">
      <v-col class="text-center" cols="12"> less is more </v-col>
    </v-footer>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
}
</script>
