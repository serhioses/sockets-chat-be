export class UserDTO {
    id;
    email;
    fullName;
    avatar;
    createdAt;

    constructor(model) {
        this.id = model._id;
        this.email = model.email;
        this.fullName = model.fullName;
        this.avatar = model.avatar;
        this.createdAt = model.createdAt;
    }
}
