'use client'

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import {User} from 'next-auth'
import { Button } from "./ui/button"
import Logo from "../../assets/Logo3.png"
import Image from "next/image"
import { useRouter } from "next/navigation"
const Navbar = () => {
const router = useRouter()
    const {data: session} = useSession();
    const user: User = session?.user as User
  return (
    <nav className="p-4 md:p-6 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <Link href="/">
                <Image src={Logo} alt="logo" className="w-16 h-16"/>
            </Link>
            {
                session ? (
                    <div>
                        <span className="mr-4">Welcome {user?.username || user?.email}</span>
                    <Button onClick={() => {signOut(); router.replace('/sign-in')}} className="w-full md:w-auto">Logout</Button>
                    </div>
                ) : (
                    <Link href="/sign-in">
                        <Button className="w-full md:w-auto">Login</Button>
                    </Link>
                )
            }
        </div>
    </nav>
  )
}

export default Navbar
