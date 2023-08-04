import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { toast } from 'react-toastify'
import React, { useState } from 'react'
import { RiSearch2Line } from 'react-icons/ri'
import { db } from '../firebase/firebase'
import Avatar from './Avatar'
import ToastMessage from './ToastMessage'
import { useAuth } from '../context/authContext'
import { chatProviderContext } from '../context/chatContext'

const Search = () => {
    const { currentuser } = useAuth()
    const {  dispatch } = chatProviderContext()
    const [userName, setUserName] = useState('')
    const [error, seterror] = useState(false)
    const [user, setuser] = useState(null)

    const onKryUP = async (e) => {
        if (e.key === 'Enter' && userName) {
            try {
                seterror(false)
                const userRef = collection(db, "users")
                const q = query(userRef, where("displayName", "==", userName))
                const querySnapShot = await getDocs(q)
                if (querySnapShot.empty) {
                    seterror(true)
                    setuser(null)
                } else {
                    querySnapShot.forEach((doc) => {
                        setuser(doc.data())
                    })
                }
                console.log(user)
            } catch (error) {
                console.error(error);
                seterror(true)
            }
        }
    }

    const handleSelect = async () => {
        try {
            const combineId = currentuser.uid > user.uid ? currentuser.uid + user.uid : user.uid + currentuser.uid;
            const res = await getDoc(doc(db, "Chats", combineId))


            if (!res.exists()) {
                //chat doc is not exists
                await setDoc(doc(db, "Chats", combineId), {
                    messages: []
                })
                const currentuserChatRef = await getDoc(doc(db, "userChats", currentuser.uid))

                const userChatRef = await getDoc(doc(db, "userChats", user.uid))

                if (!currentuserChatRef.exists()) {
                    await setDoc(doc(db, "userChats", currentuser.uid), {})
                }
                toast.promise(async () => {
                    await updateDoc(doc(db, "userChats", currentuser.uid), {
                        [combineId + ".userInfo"]: {
                            uid: user.uid,
                            displayName: user.displayName,
                            photoURL: user.photoURL || null,
                            color: user.color
                        },
                        [combineId + ".date"]: serverTimestamp()
                    })
                }, {
                    pending: 'creating chat link',
                    success: 'chat link successfully created',
                    error: 'please try again later'
                }, {
                    autoClose: 5000
                })


                if (!userChatRef.exists()) {
                    await setDoc(doc(db, "userChats", user.uid), {})
                }
                toast.promise(async () => {
                    await updateDoc(doc(db, "userChats", user.uid), {
                        [combineId + ".userInfo"]: {
                            uid: currentuser.uid,
                            displayName: currentuser.displayName,
                            photoURL: currentuser.photoURL || null,
                            color: currentuser.color
                        },
                        [combineId + ".date"]: serverTimestamp()
                    })
                }, {
                    pending: 'creating chat link',
                    success: 'chat link successfully created',
                    error: 'please try again later'
                }, {
                    autoClose: 5000
                })

            } else {
                //chat doc is exists
                await updateDoc(doc(db,"userChats",currentuser.uid),{
                    [combineId + ".chatDeleted"]:deleteField()
                  })
            }

            setuser(null)
            setUserName('')
            dispatch({ type: "CHANGE_USER", payload: user })
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className='shrink-0'>
            <ToastMessage/>
            <div className="relative">
                <RiSearch2Line className='absolute top-4 left-4 text-c3' />
                <input
                    type="search"
                    placeholder='Search user...'
                    onChange={(e) => { setUserName(e.target.value) }}
                    onKeyUp={onKryUP}
                    autoFocus
                    className='w-full h-12 rounded-xl bg-c1/[0.5] pl-11 placeholder:text-c3 pr-16 outline-none text-base'
                />
                <span className="absolute top-[14px] right-4 text-sm text-c3">Enter</span>
            </div>
            {
                error && (<>
                    <div className="mt-5 w-full text-center text-sm">
                        User Not Found
                    </div>
                    <div className="w-full h-[1px] bg-white/[0.1]" />
                </>)
            }
            {user && (<>
                <div className=" mt-5 flex items-center gap-4 rounded-xl hover:bg-c5 px-4 py-2 cursor-pointer" onClick={() => handleSelect(user)} >

                    <Avatar
                        size="large"
                        user={user}
                    />
                    <div className="flex flex-col grow gap-1">
                        <span className="items-center justify-between flex text-white text-base font-medium">
                            {user.displayName}
                        </span>
                        <p className='text-sm text-c3'>{user.email}</p>
                    </div>
                </div>
                <div className="w-full h-[1px] bg-white/[0.1]" />
            </>)}
        </div>
    )
}

export default Search