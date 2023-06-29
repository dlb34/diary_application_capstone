import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class AttachmentUtils {
    constructor(
        private readonly myS3 = new XAWS.S3({ signatureVersion: 'v4' })) {
    }

    // function to generate a signed URL for uploading image to my S3 bucket
    createSignedUrl(diaryId: string): string {
        const theSignedUrl = this.myS3.getSignedUrl('putObject', {
            Bucket: process.env.ATTACHMENT_S3_BUCKET,
            Key: diaryId,
            Expires: Number(process.env.SIGNED_URL_EXPIRATION)
        });
        return theSignedUrl as string;
    }
}