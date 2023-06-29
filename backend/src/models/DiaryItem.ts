export interface diaryItem {
  userId: string
  diaryId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
