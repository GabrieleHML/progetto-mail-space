export class Email {
    sender: string;
    subject: string;
    body: string;

    constructor(sender: string, subject: string, body: string) {
        this.sender = sender;
        this.subject = subject;
        this.body = body;
    }
}