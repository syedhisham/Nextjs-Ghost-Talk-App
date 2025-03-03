'use client';

import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message } from "@/models/user.model";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, {AxiosError} from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const page = () => {
  const [messages, setMessages] = useState<Message []>([]);
  const [loading, setLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  //? Function to delete the message immedietly from the UI
  const handleDeleteMessages = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId))
  }
  const {data: session} = useSession()

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })

  //? destructuring to extract certain form properties
  const {register, watch, setValue} = form;

  //? watch ko inject krna parta h k kis chez ko watch karr rha hn
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessage = useCallback(
    async() => {
      setIsSwitchLoading(true);
  
      try {
        const response = await axios.get<ApiResponse>("/api/accept-messages");
        setValue('acceptMessages', response.data.isAcceptingMessage!)
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        toast(axiosError.response?.data.message || 'Failed to fetch message settings')
      } finally {
        setIsSwitchLoading(false)
      }
  }, [setValue])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setLoading(true);
    setIsSwitchLoading(false);
    try {
      const response = await axios.get<ApiResponse>("/api/get-messages");
      setMessages(response.data.messages || []);
  
      if (refresh) {
        toast('Showing latest messages!');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast(axiosError.response?.data.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
      setIsSwitchLoading(false);
    }
  }, [setValue]);
  

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessage()

  }, [session, setValue, fetchAcceptMessage, fetchMessages])

  //? Handle Switch Change
  const handleSwitchChange = async() => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages
      });
      setValue('acceptMessages', !acceptMessages)
      toast(response.data.message || 'Is Accepting Message flag toggled successfuly!')
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast(axiosError.response?.data.message || 'Failed to toggle accept message flag')
    }
  }

  //? Url making
  const username = session?.user?.username
  console.log("User object:", session?.user);

  //? can use window because the component is client component 
  // const baseUrl = `${window.location.protocol}//${window.location.host}`;
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipBoard = () => {
    //? can use navigator bcz of client component
    navigator.clipboard.writeText(profileUrl);
    toast('URL copied')
  }
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input 
          type="text"
          value={profileUrl}
          disabled
          className="input iput-boardered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipBoard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch 
        //? Aik h data hy to register use kia instead of form aur register ko form is destructure b kia hua h
        {...register('acceptMessages')}
        checked={acceptMessages}
        onCheckedChange={handleSwitchChange}
        disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>

      <Separator />

      <Button
      className="mt-4"
      variant="outline"
      onClick={(e) => {
        e.preventDefault();
        fetchMessages()
      }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin"/>
        ) : (
          <RefreshCcw className="h-4 w-4"/>
        )}
      </Button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
            key={message._id as string}
            message={message}
            onMessageDelete={handleDeleteMessages}
            />
          ))
        ): (
          <p>No Message to Display</p>
        )}
      </div>
    </div>
  )
}

export default page
