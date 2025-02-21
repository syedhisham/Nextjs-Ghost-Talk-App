import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    console.log("User credentials are: ", username, email, password);

    //? Check for the availibility of each required field
    if (!username || !email || !password) {
      return Response.json(
        { message: "All fields are required to sign up" },
        { status: 401 }
      );
    }
    //? Check the user by Username and the isVerified property should be true
    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingVerifiedUserByUsername) {
      return Response.json(
        { message: "Username is already taken", success: false },
        { status: 400 }
      );
    }

    //? Generate VerifyCode
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    //? Check User by email
    const existingUserByEmail = await UserModel.findOne({ email });

    //? If user email exists
    if (existingUserByEmail) {
      //? If user's email exists and is verified then return
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            message: "User already exists with the provided email",
            success: false,
          },
          { status: 400 }
        );
      }
      //? If user's email exists and is not verified then update the user password, verifyCode and verifyCodeExpiry
      else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingUserByEmail.save();
      }
    }

    //? If user email does not exist create new User
    else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }

    //? Send Verification email for both the cases email exists or not exists
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    console.log("Email respnse is:", emailResponse);

    //? If email is not sent
    if (!emailResponse.success) {
      return Response.json(
        { message: emailResponse.message, success: false },
        { status: 500 }
      );
    }

    //? Return success response if user is created or updated
    return Response.json(
      {
        message: "User registered successfuly! Please verify your email",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registring user", error);

    return Response.json(
      { message: "Error while registring user", success: false },
      { status: 500 }
    );
  }
}
