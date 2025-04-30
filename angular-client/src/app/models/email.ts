export class Email {
    id: number;
    sender: string;
    subject: string;
    body: string;
    labels: string[]

    constructor(id: number, sender: string, subject: string, body: string, labels: string[]) {
        this.id = id;
        this.sender = sender;
        this.subject = subject;
        this.body = body;
        this.labels = labels;
    }
}