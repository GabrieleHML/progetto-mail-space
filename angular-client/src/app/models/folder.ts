export class Folder {
    id: number;
    user_email: string;
    name: string;

    constructor(id: number, user_email: string, name: string) {
        this.id = id;
        this.user_email = user_email;
        this.name = name;
    }
}