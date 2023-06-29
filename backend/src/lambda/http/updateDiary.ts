import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateDiary } from '../../businessLogic/diarys'
import { UpdateDiaryRequest } from '../../requests/UpdateDiaryRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const diaryId = event.pathParameters.diaryId;

    // Parse the request body as an UpdatediaryRequest object
    const updatedDiary: UpdateDiaryRequest = JSON.parse(event.body);
    // diary: Update a diary item with the provided id using values in the "updateddiary" object
    
    // Extract the user ID from the request event
    const userId = getUserId(event);

    // Update the diary item
    await updateDiary(diaryId, userId, updatedDiary);

    // Return a successful response with no content
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: null
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )