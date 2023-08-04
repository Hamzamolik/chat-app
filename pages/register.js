import Link from 'next/link'
import React, { useEffect, useContext, useState } from 'react'

import { IoLogoGoogle, IoLogoFacebook } from 'react-icons/io'
import { auth } from '../firebase/firebase'
import ToastMessage from '../components/ToastMessage'
import { toast } from 'react-toastify'
import { profileColors } from '../utils/constants'

import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { db } from '../firebase/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/router'
import { UserContext } from '../context/authContext'
import Loader from '../components/Loader'

const Register = () => {
    const randIndex = Math.floor(Math.random() * profileColors.length)
    const gProvider = new GoogleAuthProvider()
    const { currentuser, isLoading } = useContext(UserContext)
    const [password, setPassword] = useState('')
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && currentuser) {
            //user loged in
            router.push('/')
        }

    }, [currentuser, isLoading])

    const signInWithGoogle = () => {
        try {
            signInWithPopup(auth, gProvider).then(() => {
                router.push('/')
            })
        } catch (error) {
            console.error(error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const displayName = e.target[0].value
        const email = e.target[1].value
        const password = e.target[2].value
        try {
            if (password.length < 6) {
                toast.warn('password must be 6 characters ', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });

            }
            const { user } = await createUserWithEmailAndPassword(auth, email, password)
            await updateProfile(user, { displayName })
            toast.success('successfully sign up!', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                displayName,
                email,
                color: profileColors[randIndex]
            })


            await setDoc(doc(db, "userChats", user.uid), {})

            router.push('/')

        } catch (error) {
            console.log(error)
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
                        type='text'
                        placeholder='UserName'
                        className='w-[350px] md:w-[500px] h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
                        autoComplete='off'
                    />
                    <input
                        type='text'
                        placeholder='Email'
                        className='w-[350px] md:w-[500px] h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
                        autoComplete='off'
                    />
                    <input
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-[350px] md:w-[500px] h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
                        autoComplete='off'
                    />

                    <button type='submit' className='mt-4 bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500 w-[350px] md:w-[500px] h-14 rounded-xl outline-none text-base font-semibold'>
                        Sign Up
                    </button>
                </form>
                <div className="mt-5 text-c3 gap-1 justify-center">
                    <span>Already have an Account?</span>
                    <Link
                        href={'/login'}
                    >
                        <span className='ml-1 text-white font-medium underline-offset-2 underline cursor-pointer'>
                            Login
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Register;