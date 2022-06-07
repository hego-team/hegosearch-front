<template>
  <div>
    <div>
      <v-row justify="center">
        <v-col cols="1" class="d-none d-lg-block">
          <h1>HEGO</h1>
        </v-col>
        <v-col cols="10" class="mt-1" lg="9">
          <div class="d-flex flex-row">
            <v-menu offset-y :close-on-content-click="close" class="mt-2">
              <template #activator="{ on, attrs }">
                <div class="flex-grow-1">
                  <v-text-field
                    ref="content"
                    v-model="searchText"
                    outlined
                    placeholder="全局搜索"
                    prepend-inner-icon="mdi-magnify"
                    hide-details
                    dense
                    v-bind="attrs"
                    v-on="on"
                    @keyup.enter.stop="SearchResult"
                  ></v-text-field>
                </div>
              </template>
              <v-list v-if="suggestions.length">
                <v-list-item
                  v-for="(item, i) in suggestions"
                  :key="i"
                  @click="setText(item)"
                >
                  <v-list-item-icon class="me-2">
                    <v-icon size="20"> mdi-magnify </v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title class="">{{ item }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-list v-if="!suggestions.length">
                <v-list-item>
                  <v-list-item-icon class="me-2">
                    <v-icon size="20"> mdi-magnify </v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title class="">暂无</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-dialog v-model="dialog" width="500">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  elevation="0"
                  outlined
                  v-bind="attrs"
                  v-on="on"
                  height="40"
                  >以图搜图
                </v-btn>
              </template>
              <v-card>
                <v-card flat class="pa-3 mt-2">
                  <v-alert
                    dense
                    class="pb-3 ml-4 mr-4 mt-3"
                    outlined
                    type="info"
                  >
                    本站搜图功能基于百度识图API
                  </v-alert>
                  <v-card-text>
                    <!-- upload photo -->
                    <client-only>
                      <file-pond
                        name="test"
                        ref="pond"
                        class="filepond"
                        label-idle="拉入文件或者点击添加图片"
                        v-bind:files="myFiles"
                        :server="server"
                        @addfile="onAddFile"
                      />
                    </client-only>
                  </v-card-text>
                </v-card>
                <v-card-actions>
                  <v-spacer></v-spacer>

                  <v-btn color="error" text @click="clickButton">
                    开始查找
                  </v-btn>
                  <v-btn color="primary" text @click="dialog = false">
                    退出
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </v-col>
        <v-col cols="2" class="mt-1">
          <div class="d-flex flex-row">
            <!-- <v-dialog v-model="setting" max-width="290">
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on" large @click="set">
                  mdi-cog-outline
                </v-icon>
              </template>
              <v-card class="dialog-setting">
                <v-card-title>
                  设置关键词
                </v-card-title>
              </v-card>
            </v-dialog> -->
            <v-badge
              bottom
              overlap
              offset-x="12"
              offset-y="12"
              class="ms-4"
              dot
            >
              <v-avatar size="40px">
                <v-img
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMzEgMjMxIj48cGF0aCBkPSJNMzMuODMsMzMuODNhMTE1LjUsMTE1LjUsMCwxLDEsMCwxNjMuMzQsMTE1LjQ5LDExNS40OSwwLDAsMSwwLTE2My4zNFoiIHN0eWxlPSJmaWxsOiNmZjE4NGU7Ii8+PHBhdGggZD0ibTExNS41IDUxLjc1YTYzLjc1IDYzLjc1IDAgMCAwLTEwLjUgMTI2LjYzdjE0LjA5YTExNS41IDExNS41IDAgMCAwLTUzLjcyOSAxOS4wMjcgMTE1LjUgMTE1LjUgMCAwIDAgMTI4LjQ2IDAgMTE1LjUgMTE1LjUgMCAwIDAtNTMuNzI5LTE5LjAyOXYtMTQuMDg0YTYzLjc1IDYzLjc1IDAgMCAwIDUzLjI1LTYyLjg4MSA2My43NSA2My43NSAwIDAgMC02My42NS02My43NSA2My43NSA2My43NSAwIDAgMC0wLjA5OTYxIDB6IiBzdHlsZT0iZmlsbDojZjJjMjgwOyIvPjxwYXRoIGQ9Im0xNDEuNzQgMTk1YTExNC45MyAxMTQuOTMgMCAwIDEgMzcuOTEyIDE2LjQ1bDAuMDcgMC4wNWMtMS4xNyAwLjc5LTIuMzYwMSAxLjU1LTMuNTYwMSAyLjI5YTExNS41NSAxMTUuNTUgMCAwIDEtMTIwLjk1IDAuMjFxLTIuMDAwMS0xLjIzLTQuMDAwMi0yLjU0YTExNC43OSAxMTQuNzkgMCAwIDEgMzguMDAyLTE2LjUgMTE2LjIxIDExNi4yMSAwIDAgMSAxNS43OTEtMi40OXYtMTQuNTdjMS4zMiAwLjIyIDIuNjUwMSAwLjM5IDQuMDAwMiAwLjUxIDIuMDAwMSAwLjE5IDQuMDAwMiAwLjI4IDYuMTIwMiAwLjI5YTY0LjMzMyA2NC4zMyAwIDAgMCA4Ljg4MDQtMC42MmMwLjY3MDAzLTAuMDkgMS4zNDAxLTAuMiAyLjAwMDEtMC4zMXYxNC42OWExMTggMTE4IDAgMCAxIDE1Ljc0MSAyLjU0eiIgc3R5bGU9ImZpbGw6IzAwMDsiLz48cGF0aCBkPSJtNzkuMjkyIDIxMmEzLjQ2MDEgMy40NiAwIDAgMCAzLjg5MDIgNS4wNyAzLjM4MDEgMy4zOCAwIDAgMCAyLjEwMDEtMS42MSAzLjQ3MDEgMy40NyAwIDAgMC0xLjI4MDEtNC43MiAzLjQyMDEgMy40MiAwIDAgMC0yLjYyMDEtMC4zNCAzLjUxMDEgMy41MSAwIDAgMC0yLjA5MDEgMS42em02MC4xMjIgMC40NmEzLjQ5MDEgMy40OSAwIDAgMCAxLjIxIDQuN2gwLjA2YTMuNDYwMSAzLjQ2IDAgMCAwIDQuNzIwMi0xLjI3bDAuMDctMC4xM2EzLjQ2MDEgMy40NiAwIDAgMC0xLjM0LTQuNiAzLjQ2MDEgMy40NiAwIDAgMC0yLjU4MDEtMC4zMiAzLjUzMDEgMy41MyAwIDAgMC0yLjEwMDEgMS42MXptOS44MDA0IDUuNyA1Ljg2MDIgNS44N2MtMS4zOSAwLjUtMi43OTAxIDEtNC4yMTAyIDEuNDRsLTQuNDgwMi00LjQ3YTcuNTIwMyA3LjUyIDAgMCAxLTEuOTQwMSAwLjgxIDcuODMwMyA3LjgzIDAgMCAxLTYuMDAwMi0wLjc5IDcuODcwMyA3Ljg3IDAgMCAxLTIuOTIwMS0xMC42OXYtMC4wN2E3Ljg5MDMgNy44OSAwIDAgMSAxMC43Ny0yLjg4bDAuMTIgMC4wN2E3Ljg2MDMgNy44NiAwIDAgMSAyLjc5MDEgMTAuNjJ2MC4wN3ptLTM3LjcwMS0yLjM2LTkuNTAwNCA5LjUxdjQuOWMtMS4zNS0wLjE2LTIuNjgwMS0wLjMzLTQuMDAwMi0wLjU0di02bDAuNTgwMDItMC41OCAxMC4xLTEwLjA5YTcuODcwMyA3Ljg3IDAgMSAxIDIuODQwMSAyLjg2em03LjMyMDMtNS45MWEzLjQ2MDEgMy40NiAwIDEgMC0xLjYxMDEgMi4xIDMuMzgwMSAzLjM4IDAgMCAwIDEuNjEwMS0yLjF6bS0yOS43NDEgNy44MiAzLjA5MDEgMy4xIDAuNTkwMDIgMC41OXY3LjM2Yy0xLjM0MDEtMC4yNi0yLjY4MDEtMC41NS00LjAwMDItMC44N3YtNC44NGwtMi41MTAxLTIuNTFhNy41MjAzIDcuNTIgMCAwIDEtMS45NDAxIDAuODEgNy44ODAzIDcuODggMCAxIDEgMS45MTAxLTE0LjQzIDcuODcwMyA3Ljg3IDAgMCAxIDIuODkwMSAxMC43NXoiIHN0eWxlPSJmaWxsOiNmZmY7Ii8+PHBhdGggZD0ibTEzNy4zOCAxMS4xNDhjLTEyLjIzIDEuOTU5My0xOC41MTEgMTQuNjA2LTQzLjQzNiA5LjQ5MTUtMTEuMjg1LTMuMjA1NC0xNi40MDYtMy41NzMtMjAuMzg5IDAuNTg1OTQtNC4xNTQ4IDQuMzM4NC03LjAzMyAxMi40MzUtOS44MTg0IDIxLjcwNi0yLjEzNTQgNy40MTM2LTMuNzE4NyAxNC4zODEtNC43NDYxIDIxLjY0NmgxMTIuN2MtMy40ODc4LTI0LjI5My0xMC44MjItNDMuMjgxLTI1LjE4Mi01MS4wNjEtMy41MzE0LTEuNjIzLTYuNTI3NC0yLjI5NTktOS4xMjg5LTIuMzYxM3oiIHN0eWxlPSJmaWxsOiMzMzM7Ii8+PHBhdGggZD0ibTExNC4zNyA0My4zODNjLTE5LjQ0NSAwLjA4OC0zOC41MjQgMi4wNzI0LTUyLjM3OSA1LjY5OTItMS4yNzY2IDQuNTc5NS0yLjQzMTcgMTAuMTY5LTMuMjI4NSAxNi44MDdoMTEzLjExYy0wLjgzNzMxLTYuMDEwNy0xLjkxNjQtMTEuNjc0LTMuMzE4NC0xNi45MjQtMTUuMjI5LTMuODg0Mi0zNC44NzMtNS42NjkzLTU0LjE4LTUuNTgyeiIgc3R5bGU9ImZpbGw6I2FmYWZhZjsiLz48cGF0aCBkPSJtMTE1LjUgNTUuNzczYy01OC4zOSAwLTEwNS43MyAxNS40NzYtMTA1LjczIDM0LjU3aDAuMDMxMmMwIDExLjI5NSAxNi40OTYgMjEuMzE5IDQyLjEyNiAyNy42MjctMC4xMDMzMS03Ljc3MDQgMi43ODgtMjEuOTA0IDUuMjczNC0zMS4wMzEgNi4wOTM1LTEuNzE2OCA2LjkyOTQtMS44OTcxIDEzLjE2Ny0yLjk5MTkgMTQuODc0LTIuODI1NiAyOS45OS00LjIwMzcgNDUuMTMzLTQuMTE1MyAxNS4xNDMtMC4wODg0IDMwLjI1OSAxLjI4OTcgNDUuMTMzIDQuMTE1MyA2LjIzNzIgMS4wOTQ3IDcuMjA2NSAxLjI3NTEgMTMuMyAyLjk5MTkgMi40ODU0IDkuMTI2NyA1LjM3NjggMjMuMjYgNS4yNzM0IDMxLjAzMSAyNS42My02LjMwODIgNDEuOTkzLTE2LjMzMiA0MS45OTMtMjcuNjI3aDAuMDMxMmMwLTE5LjA5My00Ny4zNC0zNC41Ny0xMDUuNzMtMzQuNTd6IiBzdHlsZT0iZmlsbDojMjIyOyIvPjxwYXRoIGQ9Im03Mi4wODggODMuNTMzYy02Ljk3NjUgMS4xMTQ3LTEzLjM1NyAyLjg1Ni0xOC40MzkgNC4zNDc3LTEuMTg2MSA3LjQxNS0yLjAwMzggMTguODU4LTEuODkyNiAyNi4yOTMgNC4zMjc4LTAuNjI3OTUgMTAuMTU1LTEuMzY0NCAxMy4yOTUtMS42NDY1LTAuNDA1NTQgMC4zMDE5OCAyLjczNDQtMTcuODI3IDcuMDM3MS0yOC45OTR6bTg2LjgyNCAwYzQuMzAyOCAxMS4xNjcgNy40NDI2IDI5LjI5NiA3LjAzNzEgMjguOTk0IDMuMTM5NiAwLjI4MjEzIDguOTY3MSAxLjAxODUgMTMuMjk1IDEuNjQ2NSAwLjExMTE5LTcuNDM1MS0wLjcwNjUyLTE4Ljg3OC0xLjg5MjYtMjYuMjkzLTUuMDgyMi0xLjQ5MTYtMTEuNDYzLTMuMjMyOS0xOC40MzktNC4zNDc3eiIgc3R5bGU9ImZpbGw6IzZkM2ExZDsiLz48cGF0aCBkPSJtMTcwLjI1IDEwMGMxLjY5IDkuNjItNC43OSAyOS4yMy0yMi40IDI5LjIzLTYuODEgMC0xNS0zLjY2LTIwLjIzLTEwLTQuMzQtNS4zMy03LjU2LTEyLjg3LTYuMi0xOS40NSAxLjYzLTcuODkgNy4wNy0xMS40NSAxNC42Ny0xMi45MmE2OC4xNiA2OC4xNiAwIDAgMSAxMi41Mi0xYzEwLjc3IDAgMTkuNzggMy42MSAyMS42NCAxNC4yMnoiIHN0eWxlPSJmaWxsOiMwMGI1YjQ7c3Ryb2tlLXdpZHRoOjMuOTlweDtzdHJva2U6IzAwMDsiLz48cGF0aCBkPSJtNjAuNzUgMTAwYy0xLjY5IDkuNjIgNC43OSAyOS4yMyAyMi40IDI5LjIzIDYuODEgMCAxNS0zLjY2IDIwLjIzLTEwIDQuMzQtNS4zMyA3LjU2LTEyLjg3IDYuMi0xOS40NS0xLjYzLTcuODktNy4wNy0xMS40NS0xNC42Ny0xMi45MmE2OC4xNiA2OC4xNiAwIDAgMC0xMi41Mi0xYy0xMC43NyAwLTE5Ljc4IDMuNjEtMjEuNjQgMTQuMjJ6IiBzdHlsZT0iZmlsbDojMDBiNWI0O3N0cm9rZS13aWR0aDozLjk5cHg7c3Ryb2tlOiMwMDA7Ii8+PGxpbmUgeDE9IjEwMC4yIiB4Mj0iMTMwLjgiIHkxPSI4Ny45MiIgeTI9Ijg3LjkyIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6My45OXB4O3N0cm9rZTojMDAwOyIvPjxwYXRoIGQ9Im0xMDkuODcgMTAxLjczYzAtMi41OSAyLjUyLTQuNjkgNS42My00LjY5czUuNjMgMi4xIDUuNjMgNC42OSIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2Utd2lkdGg6My45OXB4O3N0cm9rZTojMDAwOyIvPjxwYXRoIGQ9Im0xMDAuMTkgMTUyLjA5YzIuODcyNiA0LjA2MTYgOS44MDk1IDQuNzIzMiAxNS4xMTktMC40NTQzMiA1LjA2NTYgNC41MTM0IDExLjE2NyA1LjY4OTggMTUuNDk1IDAuMzE0NTgiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDo1Ljg5NDk7c3Ryb2tlOiMxMTE7Ii8+PHBhdGggZD0ibTEwOS42NyAxMzUuNTNjLTAuOTc1OCAwLjA3NDMtMi4wNSAwLjQ1MzI3LTMuMTQ4NSAwLjk5NDE0LTQuMzIzNSAyLjEzOTktNy4zODYyIDQuMjU1Ny0xMC42MzkgNy4xNDA2LTAuNjI1MSAwLjU3MTUgMC4xMTY4IDAuNzc3ODUgMS40MjM4IDAuODczMDQgNS42OTY3IDAuMDUzNiAxNC4zODQgMC40MTQwNCAxNS4wOTgtMC44NzUgMS45MjUxLTIuMDc4OCAxLjc5NjktNS4zMzAzLTAuMTgxNi03LjMwMDgtMC43MDEtMC42NzUzMy0xLjU3NjktMC45MDYzMi0yLjU1MjctMC44MzIwM3ptMTEuNjU2IDBjLTAuOTc1OC0wLjA3NDMtMS44NTE3IDAuMTU2Ny0yLjU1MjcgMC44MzIwMy0xLjk3ODUgMS45NzA1LTIuMTA2NyA1LjIyMi0wLjE4MTcgNy4zMDA4IDAuNzE0MiAxLjI4OSA5LjQwMSAwLjkyODYgMTUuMDk4IDAuODc1IDEuMzA3LTAuMDk1MiAyLjA0ODktMC4zMDE1NCAxLjQyMzgtMC44NzMwNC0zLjI1MjQtMi44ODQ5LTYuMzE1MS01LjAwMDctMTAuNjM5LTcuMTQwNi0xLjA5ODUtMC41NDA4Ny0yLjE3MjctMC45MTk4NS0zLjE0ODUtMC45OTQxNHoiIHN0eWxlPSJmaWxsOiM2MzNiMWQ7Ii8+PC9zdmc+"
                >
                </v-img>
              </v-avatar>
            </v-badge>
          </div>
        </v-col>
      </v-row>
    </div>
    <p></p>
    <div class="d-flex flex-row" style="color: #70757a">
      <p class="">Get {{ count }} results ({{ time }} seconds)</p>
      <v-spacer></v-spacer>

      <p>设置屏蔽词:</p>
      <div class="mt-n5 ml-2" style="width: 100px !important">
        <v-text-field
          v-text-field
          color="error"
          placeholder="暂无屏蔽词"
          v-model="stopword"
        ></v-text-field>
      </div>
      <v-spacer></v-spacer>
    </div>

    <div v-if="searchDetail.length !== 0" class="search-res">
      <masonry-wall
        :items="searchDetail"
        :ssr-columns="1"
        :column-width="220"
        :gap="40"
      >
        <template #default="{ item }">
          <div class="grid">
            <figure class="effect-goliath">
              <img :src="item.image" alt="img23" />
              <!-- <v-img :src="item.image" min-height="180" width="240" class="pa-0"></v-img> -->
              <figcaption>
                <div>
                  <p v-html="item.content"></p>
                </div>
              </figcaption>
            </figure>
          </div>
        </template>
      </masonry-wall>
      <div v-if="lastPage > currentPage" class="d-flex justify-center mt-5">
        <v-btn elevation="0" @click="moreResult"> More </v-btn>
      </div>
    </div>
    <div v-if="searchDetail.length == 0" class="search-res">
      <div class="search-not-found">
        <p>没有找到您输入的关键词</p>
        <img
          src="../assets/img/not-found.jpeg"
          alt="not found"
          width="400px"
          class="search-not-found-img"
        />
      </div>
    </div>
  <div class="btn-back-top">
    <v-btn color="blue darken-2 pr-1" dark fab  @click="toTop">
      <v-icon>UP</v-icon>
    </v-btn>
  </div>
    
  </div>
</template>

<script>
import { textSearch, promptSearch } from '@/api/search'
import { uploadFile } from '@/api/upload'

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
      lastPage: -1,

      searchText: '',
      dialog: false,
      myFiles: [],
      setting: false,
      file: null,
      count: null,
      time: null,
      newDoc: [],
      stopword: '',

      suggestions: [],
    }
  },

  watch: {
    // 如果 `question` 发生改变，这个函数就会运行
    searchText() {
      this.suggestSearch()
    },
  },
  mounted() {
    textSearch({
      limit: 80,
      query: this.$route.query.q,
      filter: '',
      page: 1,
    }).then((res) => {
      this.searchDetail = res.documents
      this.lastPage = res.page.total
      this.currentPage = 1
      this.count = res.total
      this.time = res.time / 1000
    })
    this.searchText = this.$route.query.q
  },

  methods: {
    toTop() {
      document.documentElement.scrollTop = 0;
    },
    setText(sentence) {
      this.searchText = sentence
      this.SearchResult()
    },
    suggestSearch() {
      promptSearch({
        query: this.searchText,
      })
        .then((res) => {
          this.suggestions = res
        })
        .catch(() => {
          this.suggestions = []
        })
    },
    clickButton() {
      this.dialog = false
      uploadFile(this.file).then((res) => {
        res = res.data
        this.searchDetail = res.documents
        this.lastPage = res.page.total
        this.currentPage = res.page.total
        this.count = res.total
        this.time = res.time / 1000
      })
    },
    onAddFile(error, file) {
      this.file = file
      console.log('file added', { error, file })
    },
    SearchResult() {
      textSearch({
        limit: 80,
        query: this.searchText,
        filter: this.stopword,
        page: this.currentPage,
      }).then((res) => {
        this.searchDetail = res.documents
        this.lastPage = res.page.total
        this.currentPage = 1
        this.count = res.total
        this.time = res.time / 1000
        this.$router.push({
          name: 'images',
          query: { q: this.searchText },
          replace: true,
        })
      })
    },
    moreResult() {
      this.currentPage++
      textSearch({
        limit: 80,
        query: this.searchText,
        filter: this.stopword,
        page: this.currentPage,
      }).then((res) => {
        if (this.currentPage < this.lastPage) {
          const docs = res.documents
          for (let index = 0; index < docs.length; index++) {
            const element = docs[index]
            this.searchDetail.push(element)
          }
        }
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
  margin-top: 60px;
}

.recommand-text-div {
  height: 81px;
  overflow: hidden;
}

figure.effect-goliath img,
figure.effect-goliath h2 {
  -webkit-transition: -webkit-transform 0.35s;
  transition: transform 0.35s;
}

figure.effect-goliath img {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

figure.effect-goliath h2,
figure.effect-goliath p {
  position: absolute;
  bottom: 5px;
  left: 0;
  padding: auto;
}

figure.effect-goliath p {
  text-transform: none;
  font-size: 90%;
  opacity: 0;
  -webkit-transition: opacity 0.35s, -webkit-transform 0.35s;
  transition: opacity 0.35s, transform 0.35s;
  -webkit-transform: translate3d(0, 30px, 0);
  transform: translate3d(0, 30px, 0);
}

figure.effect-goliath:hover img {
  -webkit-transform: translate3d(0, -50px, 0);
  transform: translate3d(0, -50px, 0);
}

figure.effect-goliath:hover h2 {
  -webkit-transform: translate3d(0, -100px, 0);
  transform: translate3d(0, -100px, 0);
}

figure.effect-goliath:hover p {
  opacity: 1;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

figure.effect-goliath {
  min-height: 100px;
  width: 240px;
}

.grid figure h2 {
  word-spacing: -0.15em;
  font-weight: 300;
}

.grid figure p {
  margin: 0;
  width: 100%;
}

.grid figure p {
  letter-spacing: 1px;
  font-size: 72%;
}
/* Common style */
.grid figure {
  position: relative;
  float: left;
  overflow: hidden;
  height: auto;
  background: #2f8f9d;
  text-align: center;
  cursor: pointer;
  border-radius: 12px;
}

.grid figure img {
  position: relative;
  display: block;
  min-height: 100%;
  max-width: 100%;
  opacity: 0.9;
}

.grid figure figcaption {
  padding: 2em;
  color: #fff;
  text-transform: uppercase;
  font-size: 1.25em;
}
.grid {
  min-height: 100px;
}
.grid figure figcaption::before,
.grid figure figcaption::after {
  pointer-events: none;
}

.grid figure figcaption {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.filepond--root .filepond--credits {
  color: #fff !important;
}
.dialog-setting {
  top: 0;
  right: 0;
  position: absolute;
  height: 100%;
  width: 400px;
  background-color: #f6fbf4 !important;
}
.search-not-found {
  display: block;
  text-align: center;
  margin: 0 auto;
}
.btn-back-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
