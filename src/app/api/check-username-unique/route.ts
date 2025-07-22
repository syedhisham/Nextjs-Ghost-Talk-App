import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { userNameValidation } from "@/schemas/signUpSchema";

const UserNameQuerySchema = z.object({
  username: userNameValidation,
});

export async function GET(request: Request) {
   
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = { username: searchParams.get("username") };

    //? Validate with zod
    const result = UserNameQuerySchema.safeParse(queryParam);
    console.log("Zod validation result is: ",result);
    //! ye jo result hy isky andar bht sari chezen milti hen jesy k .success, .error, .data

    //?If the user entered incorrect username
    if (!result.success) {
      const userNameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            userNameErrors.length > 0
              ? userNameErrors.join(", ")
              : "Invalid Username query parameter",
        },
        { status: 400 }
      );
    }

    const {username} = result.data

    //? Check for the existing username
    const existingVerifiedUser = await UserModel.findOne({username, isVerified: true});

    //? If username exists
    if (existingVerifiedUser) {
        return Response.json(
            {
                success: false,
                message: "Username is already taken!"
            },
            {status: 400}
        )
    }
    //? If username does not exists in the DB
    return Response.json(
        {
            success: true,
            message: "Username is unique"
        },
        {status: 400}
    ) 
  } catch (error) {
    console.error("Error Checking Username", error);
    return Response.json(
      { success: false, message: "Error checking username!" },
      { status: 500 }
    );
  }
}
