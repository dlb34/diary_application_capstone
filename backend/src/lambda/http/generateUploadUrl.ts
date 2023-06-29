import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { generatePresignedUrl } from '../../businessLogic/diarys'
import { getUserId } from '../utils'

// Return a presigned URL to upload a file for a diary item with the provided id
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const diaryId = event.pathParameters.diaryId;
    
    // Extract the user ID from the request event
    const userId = getUserId(event);
    
    const uploadUrl = await generatePresignedUrl(diaryId, userId);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl: uploadUrl
      })
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