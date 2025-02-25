import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();

  //? Check is user authenticated
  const session = await getServerSession(authOptions);
  //? extract the user from the session
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

  //? extract the userId from the user
  //   const userId = user._id
  //! As we have converted the userId into string inthe options.ts file for authentication we have to convert it back to mongoose Object for aggregation pipelines, otherwise errors can occur
  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    //? Todo comment
    const user = await UserModel.aggregate([
      {
        $match: {
          id: userId,
        },
      },
      {
        $unwind: "$messages",
      },
      {
        $sort: {
          "messages.createdAt": -1,
        },
      },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
        },
      },
    ]);

    //? If user not found or nothing in the user
    if (!user || user.length === 0) {
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
        messages: user[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {}
}
