import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();

  //? getServerSession ko authOptions lagengy to know what to do
  const session = await getServerSession(authOptions);

  //? extract the user from the session that we already set in the session
  //? Optionally set the type of the user for better debugging and type safety
  //? What session?.user as User Does: Forces TypeScript to treat session.user as our custom User type.
  const user: User = session?.user as User;

  //? If no session or no user in the session --> that means the user is not logged in
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Autheticated",
      },
      { status: 401 }
    );
  }
  //? extract the userId from the user
  const userId = user._id;

  //? extract acceptMessage flag from frotend
  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      //? Is sy ye hoga k jo return mlega wo updated value mlegi
      { new: true }
    );
    //? If no updated user
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to update user status to accept messages",
        },
        { status: 401 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Status toggled!",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Failed to update user status to accept messages", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update user status to accept messages",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);

  const user: User = session?.user as User;
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Autheticated",
      },
      { status: 401 }
    );
  }

  const userId = user._id;

  try {
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found!",
        },
        { status: 404 }
      );
    }
    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in getting messages acceptance!", error);

    return Response.json(
      {
        success: false,
        message: "Error in getting messages acceptance!",
      },
      { status: 500 }
    );
  }
}
