<template>
  <div>
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
        @keyup.enter.stop="SearchResult"
      ></v-text-field>
    </div>
    <div class="search-res">
      <v-row no-gutters>
        <v-col
          v-for="(data, i) in currentResult"
          :key="i"
          cols="12"
          md="3"
          class="pl-3 pr-3 pt-4"
        >
          <!-- <v-card class="">
            <div>
              <div class="">
                <div class="mt-6 ml-6">
                  <v-img
                    :src="data.url"
                    class="rounded-lg"
                    width="80px"
                    height="80px"
                  ></v-img>
                </div>
                <div class="mt-3">
                  <span class="font-weight-bold text-xl">
                    {{ data.text }}
                  </span>
                </div>
              </div>
            </div>
          </v-card> -->
          <div>
            <div class="search-card-pic">
              <v-img height="180" :src="data.url"></v-img>
            </div>
            <div class="search-card-text">
              {{ data.text }}
            </div>
            <!-- <v-card-title>Tonight's availability</v-card-title> -->
          </div>
        </v-col>
      </v-row>
      <v-pagination
        v-model="currentPage"
        class="mt-5 mb-15"
        :length="pageLength"
        :total-visible="pageVisible"
        @input="onPageChange"
      >
      </v-pagination>
    </div>
  </div>
</template>

<script>
import { search } from '@/api/search'

export default {
  name: 'SearchPage',
  data() {
    return {
      currentResult: [],
      searchDetail: [],
      currentPage: 1,
      pageSize: 8,
      pageLength: 20,
      pageVisible: 10,
      searchText: '',
    }
  },
  mounted() {
    search({
      limit: 0,
      text: this.$route.query.q,
      stopWord: '',
    }).then((res) => {
      this.searchDetail = res.data.result
      const cur = this.pageSize * this.currentPage
      const prev = this.pageSize * this.currentPage - this.pageSize
      this.pageLength = Math.ceil(this.searchDetail.length / this.pageSize)
      this.currentResult = this.searchDetail.slice(prev, cur)
    })
  },

  methods: {
    SearchResult() {
      search({
        limit: 0,
        text: this.searchText,
        stopWord: '',
      }).then((res) => {
        this.searchDetail = res.data.result
        const cur = this.pageSize * this.currentPage
        const prev = this.pageSize * this.currentPage - this.pageSize
        this.pageLength = Math.ceil(this.searchDetail.length / this.pageSize)
        this.currentResult = this.searchDetail.slice(prev, cur)
        this.currentPage = 1
        this.$router.push({ name: 'search', query: { q: this.searchText } })
      })
    },
    onPageChange(page) {
      this.currentPage = page
      const cur = this.pageSize * this.currentPage
      const prev = this.pageSize * this.currentPage - this.pageSize
      this.currentResult = this.searchDetail.slice(prev, cur)
    },
  },
}
</script>

<style>
.search-res {
  margin-top: -420px;
}

.recommand-text-div {
  height: 81px;
  overflow: hidden;
}

.search-card-text {
  font-family: 'PingFang SC', 'HarmonyOS_Medium', 'Helvetica Neue',
    'Microsoft YaHei';
  font-weight: 500;
  min-height: 70px;
  font-size: 18px;
}

.search-card-pic {
  border-radius: 7px;
  overflow: hidden;
}
</style>
