import Link from 'next/link'
import React, { useContext, useEffect, useState } from 'react'

import ToastMessage from '../components/ToastMessage'
import { toast } from 'react-toastify'
import { IoLogoGoogle, IoLogoFacebook } from 'react-icons/io'

import { auth } from '../firebase/firebase'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth'
import { useRouter } from 'next/router'
import { UserContext } from '../context/authContext'
import Loader from '../components/Loader'

const Login = () => {
    const gProvider = new GoogleAuthProvider()
    const { currentuser, isLoading, setCurrentuser } = useContext(UserContext)
    const router = useRouter()
    const [email, setemail] = useState('')

    useEffect(() => {
        if (!isLoading && currentuser) {
            //user loged in
            router.push('/')

        }
    }, [currentuser, isLoading])


    const handleSubmit = (e) => {
        e.preventDefault()
        const email = e.target[0].value
        const password = e.target[1].value
        try {
            toast.promise(async () => {
                await signInWithEmailAndPassword(auth, email, password)
                router.push('/')
            }, {
                pending: 'checking',
                success: 'successfully sign in',
                error: 'Enter a valid register email'
            }, {
                autoClose: 5000
            })
        } catch (error) {
            console.log(error)
        }
    }


    const signInWithGoogle = async () => {
        try {
            const { user } = await signInWithPopup(auth, gProvider)
            router.push('/')
            if (user) {
                setCurrentuser(user)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const resetPassword = async () => {
        try {
            toast.promise(async () => {
                await sendPasswordResetEmail(auth, email)
            }, {
                pending: 'Generating reset password link',
                success: 'Reset password link sent to your email address',
                error: 'Enter a valid register email'
            }, {
                autoClose: 5000
            })
        } catch (error) {
            console.error(error)
        }
    }

    return isLoading || (!isLoading && currentuser) ? <Loader /> : (
        <div className='h-screen justify-center items-center bg-c1 w-screen text-white flex' >
            <ToastMessage />
            <div className="flex items-center flex-col md:w-[600px]">
                <div className="text-center">
                    <div className="sm:text-3xl md:text-4xl">
                        Login to Your Account
                    </div>
                    <div className="text-c3 mt-3">
                        Connect and chat with anyone and anywhere
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full mt-10 mb-5">
                    <div className="bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500 w-1/2 h-14 rounded-md cursor-pointer p-[1px]">
                        <div className="flex items-center justify-center gap-3 text-white font-semibold bg-c1 w-full h-full rounded-md">
                            <IoLogoGoogle fontSize={24} />
                            <span onClick={signInWithGoogle} >Login with Google</span>
                        </div>
                    </div>
                    <div className="bg-gradient-to-l from-indigo-500 via-purple-500 to-pink-500 text-sm md:font-medium flex-1 w-1/2 h-14 rounded-md cursor-pointer p-[1px]">
                        <div className=" flex items-center text-sm md:font-medium flex-1 justify-center gap-3 text-white font-semibold bg-c1 sm:w-full  h-full rounded-md">
                            <IoLogoFacebook fontSize={24} />
                            <span>Login with Facebook</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-5 h-[1px] bg-c3"></span>
                    <span className="text-c3 font-semibold">OR</span>
                    <span className="w-5 h-[1px] bg-c3"></span>
                </div>
                <form onSubmit={handleSubmit} className='flex flex-col sm:w-full items-center gap-3 md:w-[500px] mt-5' >
                    <input
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setemail(e.target.value)}
                        className='w-[350px] md:w-[500px] h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
                        autoComplete='off'
                    />
                    <input
                        type='password'
                        placeholder='Password'
                        className='w-[350px] md:w-[500px] h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
                        autoComplete='off'
                    />
                    <div className="text-right w-full text-c3">
                        <span className="cursor-pointer text-base" onClick={resetPassword} >Forget Password</span>
                    </div>
                    <button type='submit' className='mt-4 bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500 w-[350px] md:w-[500px] h-14 rounded-xl outline-none text-base font-semibold'>
                        Login to Your Account
                    </button>
                </form>
                <div className="mt-5 text-c3 gap-1 justify-center">
                    <span>Not a member yet?</span>
                    <Link
                        href={'/register'}
                    >
                        <span className='ml-1 text-white font-medium underline-offset-2 underline cursor-pointer'>
                            Register Now
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login;