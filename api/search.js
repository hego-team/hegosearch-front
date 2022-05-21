import { post } from './http'

export const search = params => post('api/search', params)

