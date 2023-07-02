import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";

// From lesson 2 course 4 - https://github.com/dlb34/cloud-developer/blob/master/course-04/exercises/lesson-2/solution/index.js
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

export function parseLimitParameter(event: APIGatewayProxyEvent): number {
  const limitStr = getQueryParameter(event, 'limit')
  if (!limitStr) {
    return undefined
  }

  const limit = parseInt(limitStr, 10)
  if (limit <= 0) {
    throw new Error('Limit should be positive')
  }

  return limit
}

export function parseOrderByParameter(event: APIGatewayProxyEvent): string {
  const nextKeyStr = getQueryParameter(event, 'orderBy')
  if (!nextKeyStr) {
    return undefined
  }

  return nextKeyStr;
}

export function parseNextKeyParameter(event: APIGatewayProxyEvent): any {
  const nextKeyStr = getQueryParameter(event, 'nextKey')
  if (!nextKeyStr) {
    return undefined
  }

  const uriDecoded = decodeURIComponent(nextKeyStr)
  return JSON.parse(uriDecoded)
}

export function getQueryParameter(event: APIGatewayProxyEvent, name: string): string {
  const queryParams = event.queryStringParameters
  if (!queryParams) {
    return undefined
  }

  return queryParams[name]
}

export function customEncodeKey(lastKey: any): string {
  // if lastEvaluatedKey is false
    if (!lastKey) {
      return null
    }
    // Encode the lastEvaluatedKey as a URI component
    return encodeURIComponent(JSON.stringify(lastKey))
}