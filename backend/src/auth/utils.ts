import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'
import { createLogger } from '../utils/logger'

const logger = createLogger('utils')

export function parseUserId(jwtToken: string): string {
  logger.info('parseUserId function called')
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}
