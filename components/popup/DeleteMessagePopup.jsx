import React from 'react'
import { useAuth } from '../../context/authContext'
import PopupWrapper from './PopupWrapper'
import { chatProviderContext } from '../../context/chatContext'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { RiErrorWarningLine } from 'react-icons/ri'
import { IoCloseCircleOutline } from 'react-icons/io5'
import {DELETED_FOR_ME,DELETED_FOR_EVERYONE} from '../../utils/constants'
const DeleteMessagePopup = (props) => {
    const { currentuser } = useAuth()
    const { users, dispatch } = chatProviderContext()



    return (
        <PopupWrapper {...props}>
            <div className="mt-10 mb-5">
                <div className="absolute -top-3 -right-3 flex "><IoCloseCircleOutline onClick={props.onHide} size={30} className='text-red-500 hover:text-red-700 cursor-pointer' /></div>
                <div className="flex items-center justify-center gap-3">
                    <RiErrorWarningLine size={24} className='text-red-500' />
                    <div className="text-lg">Are you sure,you want to delete this message?</div>
                </div>
                <div className="flex items-center justify-center gap-4 mt-10">
                    {props.self && <button onClick={() => props.deleteMessage(DELETED_FOR_ME)} className='border-[2px] border-red-700 py-2 px-4 text-sm rounded-md text-red-500 hover:bg-red-700 hover:text-white'>
                        Delete for me
                    </button>}

                    <button onClick={() => props.deleteMessage(DELETED_FOR_EVERYONE)} className='border-[2px] border-red-700 py-2 px-4 text-sm rounded-md text-red-500 hover:bg-red-700 ml-3 hover:text-white'>
                        Delete for everyone
                    </button>
                </div>


            </div>
        </PopupWrapper>
    )
}

export default DeleteMessagePopup