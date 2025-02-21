import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect();
    try {
        const {username, email, password} = await request.json();
        console.log("User credentials are: ",username, email, password);
        if (!username || !email || !password) {
            return Response.json(
                {message: "All fields are required to sign up"},
                {status: 401}
            )
        }
        const existingVerifiedUserByUsername = await UserModel.findOne({username, isVerified:true});
        if (existingVerifiedUserByUsername) {
            return Response.json(
                {message: "Username is already taken", success:false},
                {status: 400}
            )
        }
        const existingUserByEmail = await UserModel.findOne({email});
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
        if (existingUserByEmail) {
            true //! Todo
        } else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                    username,
                    email,
                    password: hashedPassword,
                    verifyCode,
                    verifyCodeExpiry: expiryDate,
                    isVerified: false,
                    isAcceptingMessage: true,
                    messages: [],
            })
            await newUser.save()
        }

        //! send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        console.log("Email respnse is:", emailResponse);

        
        if (!emailResponse.success) {
            return Response.json(
                {message: emailResponse.message, success: false},
                {status: 500}
            )
        }
        return Response.json(
            {message: "User registered successfuly! Please verify your email", success: true},
            {status: 201}
        )
        
        
        
    } catch (error) {
        console.error("Error registring user", error);
        return Response.json(
            {message: "Error while registring user", success: false},
            {status: 500}
        )
    }
}