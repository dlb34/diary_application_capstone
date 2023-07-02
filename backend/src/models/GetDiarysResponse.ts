import { diaryItem } from '../models/DiaryItem'

// Define the interface for the GetDiarys response
export interface GetDiarysResponse {
  // Array of DiaryItem objects
  items: diaryItem[] 
  // String representing the next key
  nextKey: string 
}