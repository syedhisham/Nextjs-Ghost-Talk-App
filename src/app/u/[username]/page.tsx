'use client'

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, {AxiosError} from "axios";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const page = () => {
  const params = useParams();
  const {username} = params;
  const[loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: ''
    }
  })

  const onSubmit = async(data: z.infer<typeof messageSchema>) => {
    setLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data, username
      });
      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || "Failed to send message!")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div>
      <div className="mt-20">
        <h1 className="text-4xl text-center  font-bold">Public Profile Link</h1>
      </div>
      <div className="mx-auto max-w-4xl mt-10">
        <p className="font-semibold mb-1">Send Anonymous message to @{username}</p>
        <div>
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Write your anonymous message here..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
            <Loader2 className="w-4 h-4 animate-spin"/> Sending...</>
          ) : ("Submit")}
        </Button>
        </div>
      </form>
    </Form>
        </div>
      </div>
    </div>
  );
};

export default page;
