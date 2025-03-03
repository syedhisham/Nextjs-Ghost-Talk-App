"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import * as React from "react";
import { Separator } from "./ui/separator";

const HowItWorks = () => {
  const [goal, setGoal] = React.useState(350);

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)));
  }

  return (
    <div>
      <Separator />
      <section className="mt-12 text-center max-w-3xl container mx-auto mb-20">
        <h2 className="text-2xl md:text-4xl font-bold">How It Works</h2>
        <p className="mt-4 text-gray-600 text-lg mb-8">
          Ghost Talk lets you send and receive anonymous messages effortlessly.
          Engage in real conversations while keeping your identity private.
        </p>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Show Steps</Button>
          </DrawerTrigger>
          <DrawerContent className="w-full mb-10">
            <div className="mx-auto w-full max-w-3xl">
              <DrawerHeader>
                <DrawerTitle className="text-center text-3xl font-bold">
                  Three simple steps
                </DrawerTitle>
              </DrawerHeader>
              <DrawerDescription className="w-full">
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg shadow-md bg-white">
                    <p className="text-xl font-semibold">Step 1</p>
                    <p className="text-gray-500 mt-2">
                      Start by entering a username or staying completely
                      anonymous.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg shadow-md bg-white">
                    <p className="text-xl font-semibold">Step 2</p>
                    <p className="text-gray-500 mt-2">
                      Send messages to others without revealing who you are.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg shadow-md bg-white">
                    <p className="text-xl font-semibold">Step 3</p>
                    <p className="text-gray-500 mt-2">
                      Receive replies and enjoy the thrill of anonymous chats.
                    </p>
                  </div>
                </div>
              </DrawerDescription>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="max-w-24 mx-auto mt-6 bg-black text-white"
                >
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </section>
    </div>
  );
};

export default HowItWorks;
