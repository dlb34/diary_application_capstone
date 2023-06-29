import * as AWS from 'aws-sdk';
const AWSXRay = require('aws-xray-sdk')
import { createLogger } from '../utils/logger';
import { diaryItem } from '../models/DiaryItem';
import { diaryUpdate } from '../models/DiaryUpdate';

const XAWS = AWSXRay.captureAWS(AWS);
const docClient = new XAWS.DynamoDB.DocumentClient();

const myLogger = createLogger('diarysAccess');

// data layer code for diary entries
export class diarysAccess {
    constructor(
        private readonly diarysTable = process.env.DIARYS_TABLE
    ) { }
    
    async getDiarysForUser(userId: string): Promise<diaryItem[]> {
        myLogger.debug('called getdiarys function');
        const tableName = this.diarysTable

        const params = {
            TableName: tableName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false,
        };
  
        const result = await docClient.query(params).promise();
        return result.Items as diaryItem[];
    }
    
    async createDiary(diaryItem: diaryItem): Promise<diaryItem> {
        myLogger.debug('called creatediary function');
        const tableName = this.diarysTable

        await docClient.put({
            TableName: tableName,
            Item: diaryItem
        }).promise();
  
        return diaryItem as diaryItem;
    }

    async updateDiary(diaryId: string, userId: string, diaryUpdate: diaryUpdate): Promise<diaryItem> {
        myLogger.debug('called updatediary function');
        const tableName = this.diarysTable

        const params = {
            TableName: tableName,
            Key: {
                diaryId: diaryId,
                userId: userId                
            },
            UpdateExpression: "set #diaryName = :diaryName, dueDate = :dueDate, done = :done",
            ExpressionAttributeNames: { '#diaryName': "name" },
            ExpressionAttributeValues: {
                ":diaryName": diaryUpdate.name,
                ":dueDate": diaryUpdate.dueDate,
                ":done": diaryUpdate.done
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await docClient.update(params).promise();
        return result.Attributes as diaryItem;
    }

    async deleteDiary(diaryId: string, userId: string): Promise<any> {
        console.log("deletediary function called");
        const tableName = this.diarysTable

        const params = {
            TableName: tableName,
            Key: {
                diaryId: diaryId,
                userId: userId                
            },
        };
        return await docClient.delete(params).promise();
    }

    async updateAttachmentForDiary(diaryId: string, userId: string, attachmentUrl: string): Promise<diaryItem> {
        myLogger.debug('updateAttachmentFordiary function called');
        const tableName = this.diarysTable

        const params = {
            TableName: tableName,
            Key: {
                diaryId: diaryId,
                userId: userId                
            },
            UpdateExpression: "set attachmentUrl = :url",
            ExpressionAttributeValues: {
                ":url": attachmentUrl
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await docClient.update(params).promise();
        return result.Attributes as diaryItem;
    }
}