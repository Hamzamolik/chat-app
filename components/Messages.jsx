import { doc, onSnapshot } from 'firebase/firestore'
import React from 'react'
import { useEffect } from 'react'
import { db } from '../firebase/firebase'
import { chatProviderContext } from '../context/chatContext'
import { useState } from 'react'
import { useRef } from 'react'
import Message from './Message'
import { useAuth } from '../context/authContext'
import { DELETED_FOR_EVERYONE, DELETED_FOR_ME } from '../utils/constants'

const Messages = () => {
  const { currentuser } = useAuth()
  const [messages, setMessages] = useState([])
  const ref = useRef()
  const {isTyping, setIsTyping, data } = chatProviderContext()

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Chats", data.chatId), (doc) => {
      if (doc.exists()) {
        setMessages(doc.data().messages)
        setIsTyping(doc.data()?.typing?.[data.user.uid] || false)
      }
      setTimeout(() => {
        scrollToBottom()
      }, 10);
    })
    return () => unsub()
  }, [data.chatId])

  const scrollToBottom = () => {
    const chatContainer = ref.current;
    chatContainer.scrollTo = chatContainer.scrollHeight
  }

  return (
    <div ref={ref} className='grow scrollbar p-5 overflow-auto flex flex-col'>
      {messages?.filter((m) => {
        return m?.deleteInfo?.[currentuser.uid] !== DELETED_FOR_ME && !m?.deleteInfo?.deleteForEveryone && !m?.deleteChatInfo?.[currentuser.uid]
      }).map((m) => (
        <Message Message={m} key={m.id} />
      ))}
    </div>
  )
}

export default Messages