import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateDiaryRequest } from '../../requests/CreateDiaryRequest'
import { getUserId } from '../utils';
import { createDiary } from '../../businessLogic/diarys'
import { messagePublishSns } from '../../utils/snsUtils'

// create diary item, extracting userId from requested event and returns response of the new item
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newDiaryEntry: CreateDiaryRequest = JSON.parse(event.body);
    // diary: Implement creating a new diary item

    // extract userId from request event
    const userId = getUserId(event);
    const newItem = await createDiary(newDiaryEntry, userId);

    messagePublishSns('Diary Entry: '+ newItem.name);

    // return response with newItem
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },


      body: JSON.stringify({
        "item": newItem
      }),
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