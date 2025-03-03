import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { Message } from "@/models/user.model";

export async function POST(request: Request) {
  await dbConnect();

  //? Extract he username and content from frontend
  const { username, content } = await request.json();
  console.log('Username and content are: ', username, content);
  

  try {
    //? find the user
    const user = await UserModel.findOne({ username });

    //? If user not found
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found!",
        },
        { status: 404 }
      );
    }
    //? if user found
    //? check if user accepting the messages
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message:
            "User is not accepting the messages! Acceptance flag is false",
        },
        { status: 403 }
      );
    }
    //? if user accepting the messages
    const newMessage = {
      content,
      createdAt: new Date(),
    };

    //? Push the message in the user's message array
    user.messages.push(newMessage as Message);

    //? Save the user
    await user.save();

    //? Return the response
    return Response.json(
      {
        success: true,
        message: "Message sent successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
      console.log("Error adding messages!");
    return Response.json(
      {
        success: false,
        message: "Error adding messages!",
      },
      { status: 500 }
    );
  }
}
