import axios from "axios"

export const  uploadFile = (file) => {
    const data = new FormData()
    data.append('file', file.file)
    data.append('page', 1)
    data.append('limit', 100)

  
    return axios({
      method: 'post',
      url: `/server/hego/search/image`,
      data,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }