import { diarysAccess } from '../dataLayer/diarysAcess';
import { AttachmentUtils } from '../utils/attachmentUtils';
import { diaryItem } from '../models/DiaryItem';
import { CreateDiaryRequest } from '../requests/CreateDiaryRequest';
import { UpdateDiaryRequest } from '../requests/UpdateDiaryRequest';
import { createLogger } from '../utils/logger';
import * as uuid from 'uuid'
import { GetDiarysResponse } from '../models/GetDiarysResponse';

const myLogger = createLogger("diarys");
const diaryAccess = new diarysAccess();
const attachmentUtils = new AttachmentUtils();

export async function createDiary(creatediaryRequest: CreateDiaryRequest, userId: string): Promise<diaryItem> {
    // Log a new diary entry
    myLogger.info("createDiary function called");

    // create unique diaryId using UUID
    const diaryId = uuid.v4();

    // fetch current timestamp for the createdAt field
    const createdAt = new Date().toISOString();

    // name and dueDate extracted from the createDiaryRequest
    const name = creatediaryRequest.name;
    const dueDate = creatediaryRequest.dueDate;

    // Create a new diaryItem
    const newItem: diaryItem = {} as diaryItem;
    newItem.userId = userId;
    newItem.diaryId = diaryId;
    newItem.createdAt = createdAt;
    newItem.name = name;
    newItem.dueDate = dueDate;
    newItem.done = false;

    return await diaryAccess.createDiary(newItem);
}

export async function getDiarys(userId: string, nextKey: any, limit: number, orderBy: string): Promise<GetDiarysResponse> {
    myLogger.info("called getdiarys function");
    return await diaryAccess.getDiarysForUser(userId, nextKey, limit, orderBy);
}

export async function deleteDiary(diaryId: string, userId: string) {
    myLogger.info("called deletediary function");
    await diaryAccess.deleteDiary(diaryId, userId);
}

export async function updateDiary(diaryId: string, userId: string, model: UpdateDiaryRequest) {
    myLogger.info("called updatediary function")
    await diaryAccess.updateDiary(diaryId, userId, model);
}

export async function generatePresignedUrl(diaryId: string, userId: string): Promise<string> {
    myLogger.info("called generatingPresignedUrl function");
    // Construct the database URL
    const databaseUrl: string = `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${diaryId}`;

    // Generate the pre-signed URL for the attachment using the attachmentUtils object
    const attachmentUrl:string = attachmentUtils.createSignedUrl(diaryId);
    await diaryAccess.updateAttachmentForDiary(diaryId, userId, databaseUrl);
    return attachmentUrl;
}