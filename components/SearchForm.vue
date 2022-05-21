<template>

  <div class="search-input">
      <v-text-field
        ref="content"
        v-model="searchText"
        rounded
        outlined
        placeholder="全局搜索"
        append-icon="mdi-magnify"
        class="app-bar-search flex-grow-0"
        hide-details
        large
        v-bind="attrs"
        v-on="on"
        @keyup.enter.stop="JmpSearch"
      ></v-text-field>
    </div>
</template>

<script>

export default {
  name: 'SearchForm',

  data() {
    return {
      searchText: '',
    }
  },
  methods: {
    JmpSearch() {
      this.$router.push({ name: 'search', query: { q: this.searchText } })
    },
  },
}
</script>
<style>
.search {
  display: block;
  margin: auto;
  margin-top: 10%;
  width: 60%;
}

.search-img {
  display: block;
  margin: auto;
  margin-top: 10%;
  width: 60%;
}

.search-input {
  margin-top: 20px;
  margin-bottom: 500px;
}

.app-bar-search {
  font-size: 19px !important;
}
</style>
