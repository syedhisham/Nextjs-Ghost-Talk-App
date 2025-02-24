import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { verifySchema } from "@/schemas/verifySchema";

const verifyUserCode = verifySchema;

export async function POST(request: Request) {
    await dbConnect();

    try {
        const {username, code} = await request.json();

        const decodedUsername = decodeURIComponent(username);

        //? Find the username in the DB
        const user = await UserModel.findOne({username: decodedUsername});
        
        //? If no user found
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found!"
                },
                {status: 404}
            ) 
        }
        //? Check code validity using zod
        const result = verifyUserCode.safeParse({code});
        
        //?Check if the code is not valid
        if (!result.success) {
            const codeErrors = result.error.format().code?._errors || [];
            
            //? Return response
            return Response.json(
                {
                    success: false,
                    message: codeErrors.length > 0 ? codeErrors?.join(', ') : "Not a valid Code"
                },
                {status: 405}
            )
        }
        const validCode = result.data.code
        //? Check is code Valid and code not expired
        const isCodeValid = user.verifyCode === validCode;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        //? If both the conditions met
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            //? Return the response
            return Response.json(
                {
                    success: true,
                    message: "Account verified successfuly!"
                },
                {status: 200}
            ) 
        }
        else if(!isCodeNotExpired){
            //? Return the response
            return Response.json(
                {
                    success: false,
                    message: "The provided OTP Code is expired! Please signup again to get a new code"
                },
                {status: 400}
            ) 
        }
        else {
            //? Return the response
            return Response.json(
                {
                    success: false,
                    message: "Incorrect Verification Code!"
                },
                {status: 400}
            ) 
        }
    } catch (error) {
        console.error("Error while verifying user", error);
        return Response.json(
            {
                success: false,
                message: "Error while verifying the user"
            },
            {status: 500}
        )
    }
}