export class Email {
    sender: string;
    subject: string;
    body: string;
    s3_key: string;

    constructor(sender: string, subject: string, body: string, s3_key: string) {
        this.sender = sender;
        this.subject = subject;
        this.body = body;
        this.s3_key = s3_key;
    }
}