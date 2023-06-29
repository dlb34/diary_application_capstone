//Fields in a request to update a single diary item.
export interface UpdateDiaryRequest {
  name: string
  dueDate: string
  done: boolean
}