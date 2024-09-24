import mongoose,{ Schema, Document } from "mongoose";

export interface Message extends Document{
    content: string;
    createdAt: Date;
}

const messageSchema: Schema<Message>= new Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export interface User extends Document{
    username: string;
    email:string;
    password:string;
    isVerified: boolean;
    verifyCode:string;
    verifyCodeExpiry: Date;
    messages: Message[];
    isAcceptingMessage: Boolean;

}
const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true,"Username is required"],
        trim:true,
        unique: true
    },
    email: {
        type: String,
        unique:true,
        required: [true, "email is required"],
        match: [/.+\@.+\..+/, "please use valid email"]
    },
    password:{
        type:String,
        required: [true, "password is required"]
    },
    verifyCode:{
        type:String,
        required: [true, "password is required"]
    },
    verifyCodeExpiry:{
        type: Date,
        required: [true, "Verify code expiry is required"]
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAcceptingMessage:{
        type: Boolean,
        default: true
    },
    messages: [messageSchema]

});

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)

export default UserModel; 