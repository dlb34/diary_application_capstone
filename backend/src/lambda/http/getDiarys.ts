import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getDiarys } from '../../businessLogic/diarys'
import { getUserId } from '../utils';
import { parseNextKeyParameter, parseLimitParameter, parseOrderByParameter } from '../utils';
import { GetDiarysResponse } from '../../models/GetDiarysResponse'

// Get all diary items for logged in user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
    const userId: string = getUserId(event);
    let nextKey; 
    let limit; 
    let orderBy;
    try {
      nextKey = parseNextKeyParameter(event);
      limit = parseLimitParameter(event) || 10;
      orderBy = parseOrderByParameter(event) || '';
    } catch (e) {
      console.log('parse failed')
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Invalid parameters'
        })
      }
    }

    const response: GetDiarysResponse = await getDiarys(userId, nextKey, limit, orderBy);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: response.items,
        nextKey: response.nextKey
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