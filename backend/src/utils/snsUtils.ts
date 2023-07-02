import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'

const log = createLogger('snsUtils')

const topicArn = process.env.SNS_TOPIC_ARN

// https://docs.aws.amazon.com/sns/latest/dg/sns-publishing.html
// publih message for SNS topic
export async function messagePublishSns(text: string) {
    
    const snsClient = new AWS.SNS()

    const messageData = {
        TopicArn: topicArn,
        Message: text
    }

    await snsClient.publish(messageData).promise()
        log.info("SNS  message published")
}

// suscribe email address to sns topic
export async function emailSuscribeSns(email: string) {

    const snsClient = new AWS.SNS();
    
    await snsClient.subscribe({
            Protocol: 'EMAIL',
            TopicArn: topicArn,
            Endpoint: email
        }).promise()

    log.info("email suscribed to sns topic: " + email)
}