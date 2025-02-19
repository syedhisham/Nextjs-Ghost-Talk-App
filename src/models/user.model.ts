import mongoose, {Schema, Document} from "mongoose";

//? Mongoose interface standard structure
export interface Message extends Document{
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now()
        }
    }
)
//? Idhr message user k doc k andar hi save hrha alag s bhi krwa skty thy. We are feeding each message doc into the message array
export interface User extends Document{
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[]
}

const UserSchema: Schema<User> = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
            unique: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            match: [/.+\@.+\..+/, "Please use a valid email address"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        verifyCode: {
            type: String,
            required: [true, "Verify code is required"],
        },
        verifyCodeExpiry: {
            type: Date,
            required: [true, "Verify code expiry is required"],
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isAcceptingMessage: {
            type: Boolean,
            default: true
        },
        messages: [MessageSchema]
    }
)
// idhr ham (mongoose.model.User) tak b lkh skty bss type strict bnany k leye custom type jo bnaya hy wo bta dia
const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)

export default UserModel;