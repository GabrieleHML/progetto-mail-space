export class Email {
    id: number;
    sender: string;
    subject: string;
    body: string;

    constructor(id: number, sender: string, subject: string, body: string) {
        this.id = id;
        this.sender = sender;
        this.subject = subject;
        this.body = body;
    }
}