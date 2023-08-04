import React, { useState } from 'react'
import { useAuth } from '../context/authContext'
import Avatar from './Avatar'
import Image from 'next/image'
import { chatProviderContext } from '../context/chatContext'
import ImageViewer from 'react-simple-image-viewer'
import { Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore'
import { formateDate, wrapEmojisInHtmlTag } from '../utils/helpers'
import Icon from './Icon'
import { GoChevronDown } from 'react-icons/go'
import MessagesMenu from './MessagesMenu'
import DeleteMessagePopup from './popup/DeleteMessagePopup'
import { db } from '../firebase/firebase'
import { DELETED_FOR_EVERYONE, DELETED_FOR_ME } from '../utils/constants'


const Message = ({ Message }) => {

    const deleteMessage = async (action) => {
        try {
            const msgId = Message.id
            const chatRef = doc(db, "Chats", data.chatId)

            const chatDoc = await getDoc(chatRef)

            const updatedMessages = chatDoc?.data()?.messages?.map((message) => {
                if (message.id === msgId) {
                    if (action === DELETED_FOR_ME) {
                        message.deleteInfo = {
                            [currentuser.uid]: DELETED_FOR_ME
                        }
                    }
                    if (action === DELETED_FOR_EVERYONE) {
                        message.deleteInfo = {
                            deleteForEveryone: true
                        }
                    }
                }

                return message;
            })

            await updateDoc(chatRef, { messages: updatedMessages });
            setDeleteMenu(false)
        } catch (error) {
            console.log(error)
        }
    }

    const { currentuser } = useAuth()
    const [showMenu, setShowMenu] = useState(false)
    const [DeleteMenu, setDeleteMenu] = useState(false)
    const date = new Timestamp(Message?.date?.seconds, Message?.date?.nanoseconds).toDate()

    const { data,editMsg, seteditMsg, users, imageviewer, setImageviewer } = chatProviderContext()
    const self = Message.sender === currentuser.uid
    
    return (
        <div className={`mb-5 max-w-[75%] ${self ? "self-end" : ""}`}>
            {DeleteMenu && <DeleteMessagePopup
                onHide={() => setDeleteMenu(false)}
                className="DeleteMsgPopup"
                setDeleteMenu={setDeleteMenu}
                noHeader
                shortHeight
                self={self}
                deleteMessage={deleteMessage}
            />}
            <div className={`flex items-end gap-3 mb-1 ${self ? "justify-start flex-row-reverse" : ""}`}>
                <Avatar
                    size="small"
                    user={self ? currentuser : users[data.user.uid]}
                    className="mb-4"
                />
                <div className={`group flex flex-col gap-4 p-4 rounded-3xl relative break-all ${self ? "rounded-br-md bg-c5" : "rounded-bl-md bg-c1"}`}>
                    {Message.text && (
                        <div
                            className="text-sm"
                            dangerouslySetInnerHTML={{ __html: wrapEmojisInHtmlTag(Message.text) }}
                        >{ }</div>
                    )}

                    {Message.img && (
                        <>
                            <Image
                                src={Message.img}
                                width={250}
                                height={250}
                                alt='img'
                                className='rounded-3xl max-w-[250px]'
                                onClick={() => {
                                    setImageviewer({
                                        msgId: Message.id,
                                        url: Message?.img
                                    })
                                }}
                            />
                            {imageviewer && imageviewer.msgId === Message.id && (
                                <ImageViewer
                                    src={[imageviewer.url]}
                                    currentIndex={0}
                                    disableScroll={false}
                                    closeOnClickOutside
                                    onClose={() => setImageviewer(false)}
                                />
                            )}
                        </>
                    )}
                    <div className={`${showMenu ? "" : "hidden"} group-hover:flex absolute top-2 ${self ? "left-2 bg-c5" : "right-2 bg-c1"}`}>
                        <Icon
                            size="medium"
                            className="hover:bg-inherit rounded-none"
                            icon={<GoChevronDown size={24} className='text-c3' />}
                            onClick={() => setShowMenu(true)}
                        />
                        {showMenu && <MessagesMenu setDeleteMenu={setDeleteMenu} showMenu={showMenu} setShowMenu={setShowMenu} self={self} seteditMsg={()=>seteditMsg(Message)} />}
                    </div>
                </div>
            </div>
            <div className={`flex items-center ${self ? "justify-start flex-row-reverse mr-12" : "ml-12"}`}>
                <div className="text-xs text-c3">{formateDate(date)}</div>
            </div>
        </div>
    )
}

export default Message