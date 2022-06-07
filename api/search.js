import { post ,get} from './http'

export const search = params => post('api/search', params)
export const textSearch = params => get('/server/hego/search/text', params)
export const promptSearch = params => get('/server/hego/search/prompt', params)



