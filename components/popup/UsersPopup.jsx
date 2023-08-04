import React from 'react'
import Avatar from '../Avatar'
import { useAuth } from '../../context/authContext'
import PopupWrapper from './PopupWrapper'
import { chatProviderContext } from '../../context/chatContext'
import ToastMessage from '../ToastMessage'
import { toast } from 'react-toastify'
import { deleteField, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import Search from '../Search'
const UsersPopup = (props) => {
  const { currentuser } = useAuth()
  const { users, dispatch } = chatProviderContext()

  const handleSelect = async (user) => {
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
              email: user.email,
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

      dispatch({ type: "CHANGE_USER", payload: user })
      props.onHide()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <PopupWrapper {...props}>
      <Search />
      <div className="mt-5 flex flex-col gap-2 grow relative overflow-auto scrollbar">
        <ToastMessage />
        <div className="absolute w-full">
          {users && Object.values(users).map((user) => (
            <div className="flex items-center gap-4 rounded-xl hover:bg-c5 px-4 py-2 cursor-pointer" onClick={() => handleSelect(user)}>
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
          ))}
        </div>

      </div>
    </PopupWrapper>
  )
}

export default UsersPopup