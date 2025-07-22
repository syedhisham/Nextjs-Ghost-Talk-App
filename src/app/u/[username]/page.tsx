"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {  z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const messages = [
  "What's one thing you're genuinely curious about right now?",
  "I really appreciate your input on this. What do you think could improve it?",
  "You have such a unique perspective on things. I love hearing your thoughts!",
  "If animals could talk, which one would be the rudest?",
  "What's a skill you're currently trying to learn?",
  "You're doing a great job! What's one thing you're proud of lately?",
  "If you were a flavor of ice cream, what would you be and why?",
  "What's a lesson you learned the hard way?",
  "I admire how you always manage to stay positive, even in tough situations.",
  "What's something you're grateful for today?",
  "You're so close to achieving your goal! Keep pushing forward!",
  "If you could have a billboard with anything on it, what would it say?",
  "Life is short, but your awesomeness is long-lasting!",
  "What's the weirdest food combination you secretly enjoy?",
  "Believe in yourself; you're capable of more than you think!",
  "What's a small act of kindness you recently witnessed?",
  "I hope your day is as awesome as you are!",
  "You're not just a dreamer; you're a doer!",
  "Sometimes all you need is a good laugh and a great friend like you.",
];



  const shuffledArray = (array: string[]) => {
    for(let i = array.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
const getRandomMessages = () => {
  return shuffledArray([...messages]).slice(0, 3)
}

const Page = () => {
  const params = useParams();
  const[username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [randomMessages, setRandomMessages] = useState<string[]>([]);

  useEffect(() => {
    if (params.username) {
      setUsername(params.username as string)
    }
  }, [params])

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  
  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });
      toast.success(response.data.message);
      form.reset({ content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Failed to send message!");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setRandomMessages(getRandomMessages()); // Only runs on the client
  }, []);
  const handleSuggestMessages = () => {
    setRandomMessages(getRandomMessages())
  }
  if (!username) return null;
  return (
    <div>
      <div className="mt-10 text-center">
        <h1 className="text-4xl font-bold">Public Profile Link</h1>
      </div>

      <div className="mx-auto max-w-4xl mt-10">
        <p className="font-semibold mb-1">Send Anonymous Message to @{username}</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Write your anonymous message here..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center">
              <Button type="submit" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <section className="container mx-auto max-w-4xl mt-16">
        <p className="mb-2 font-semibold">Click on any message below to select it.</p>

        <div className="border p-4 rounded-lg">
        <Button onClick={handleSuggestMessages} className="mb-4">Suggest Messages</Button>
          <div className="flex flex-col space-y-4">
            {randomMessages.map((message, index) => (
              <Button 
              key={index}
              variant='outline'
              className="text-center"
              onClick={() => form.setValue('content', message)}
              >
                {message}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <Separator className="my-10 " />
      <div className="text-center">
        <div className="mb-4 font-semibold">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
};

export default Page;
