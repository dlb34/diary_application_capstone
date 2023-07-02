import * as AWS from 'aws-sdk';
const AWSXRay = require('aws-xray-sdk')
import { createLogger } from '../utils/logger';
import { diaryItem } from '../models/DiaryItem';
import { diaryUpdate } from '../models/DiaryUpdate';
import { customEncodeKey } from '../lambda/utils';
import { GetDiarysResponse } from '../models/GetDiarysResponse';

const XAWS = AWSXRay.captureAWS(AWS);
const docClient = new XAWS.DynamoDB.DocumentClient();

const myLogger = createLogger('diarysAccess');

// data layer code for diary entries
export class diarysAccess {
    constructor(
        private readonly diarysTable = process.env.DIARYS_TABLE
    ) { }
    
    async getDiarysForUser(userId: string, nextKey: any, limit: number, orderBy: string): Promise<GetDiarysResponse> {
          // Determine the index name based on the orderBy parameter
         let indexName = process.env.DIARYS_CREATED_AT_INDEX;
         if (!!orderBy && orderBy === "dueDate") {
             indexName = process.env.DIARYS_DUE_DATE_INDEX; 
         }

        myLogger.debug('called getdiarys function');
        const tableName = this.diarysTable
        
         // Set the parameters for the DynamoDB query - index name now included
        const params = {
            TableName: tableName,
            IndexName: indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            Limit: limit,
            ScanIndexForward: false,
            ExclusiveStartKey: nextKey
        };
        
        // Perform the DynamoDB query and await the result
        const result = await docClient.query(params).promise();
        // Prepare the response object with queried items and encoded next key
        return { 
            items: result.Items as diaryItem[],
            nextKey: customEncodeKey(result.LastEvaluatedKey)
        } as GetDiarysResponse;
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