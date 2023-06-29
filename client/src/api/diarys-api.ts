import { apiEndpoint } from '../config'
import { Diary } from '../types/Diary';
import { CreateDiaryRequest } from '../types/CreateDiaryRequest';
import Axios from 'axios'
import { UpdateDiaryRequest } from '../types/UpdateDiaryRequest';

export async function getDiarys(idToken: string): Promise<Diary[]> {
  console.log('Fetching diarys')

  const response = await Axios.get(`${apiEndpoint}/diarys`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('diarys:', response.data)
  return response.data.items
}

export async function createDiary(
  idToken: string,
  newDiary: CreateDiaryRequest
): Promise<Diary> {
  const response = await Axios.post(`${apiEndpoint}/diarys`,  JSON.stringify(newDiary), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchDiary(
  idToken: string,
  diaryId: string,
  updateDiary: UpdateDiaryRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/diarys/${diaryId}`, JSON.stringify(updateDiary), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteDiary(
  idToken: string,
  diaryId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/diarys/${diaryId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  diaryId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/diarys/${diaryId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
