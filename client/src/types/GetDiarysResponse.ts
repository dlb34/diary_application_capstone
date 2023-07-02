import { Diary } from "./Diary"

export interface GetDiarysResp {
    items: Diary[]
    nextKey?: string
}
