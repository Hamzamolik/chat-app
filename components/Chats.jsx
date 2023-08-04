import React, { useEffect, useState } from 'react'
import { chatProviderContext, } from '../context/chatContext'
import { RiSearch2Line } from 'react-icons/ri'
import Avatar from './Avatar'
import { Timestamp, collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from '../context/authContext'
import { formateDate } from '../utils/helpers'
import { useRef } from 'react'


const Chats = () => {
  const { data, users, setusers, Chats, setChats,
    selectedChats, setSelectedChats, dispatch, resetFooterState } = chatProviderContext()
  const [search, setSearch] = useState('')
  const { currentuser } = useAuth()
  const [unreadMsgs, setunreadMsgs] = useState({})
  const isBlockExecuteRef = useRef(false)
  const isUserFetchedRef = useRef(false)

  const handleSelect = (user, selectedchatid) => {
    setSelectedChats(user)
    dispatch({ type: "CHANGE_USER", payload: user })
    if (unreadMsgs?.[selectedchatid]?.length > 0) {
      readMsg(selectedchatid)
    }
  }

  useEffect(() => {
    resetFooterState()
  }, [data?.chatId])


  useEffect(() => {
    onSnapshot(collection(db, "users"), (snapshot) => {
      const UpdatedUser = {}
      snapshot.forEach((doc) => {
        UpdatedUser[doc.id] = doc.data()
      })
      setusers(UpdatedUser)
    })
    if (!isBlockExecuteRef.current) {
      isUserFetchedRef.current = true
    }
  }, [])

  useEffect(() => {
    const documentIds = Object.keys(Chats);
    if (documentIds.length === 0) return;
    const q = query(
      collection(db, "Chats"),
      where("__name__", "in", documentIds)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgs = {};
      snapshot.forEach((doc) => {
        if (doc.id !== data.chatId) {
          msgs[doc.id] = doc
            .data()
            .messages?.filter(
              (m) =>
                m?.read === false &&
                m.sender !== currentuser.uid
            );
        }
        Object.keys(msgs || {}).map((c) => {
          if (msgs[c]?.length < 1) {
            delete msgs[c];
          }
        });
      });
      setunreadMsgs(msgs);
    });
    return unsubscribe;
  }, [Chats, selectedChats]);

  useEffect(() => {
    const getChats = () => {
      onSnapshot(doc(db, "userChats", currentuser.uid), (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          setChats(data)

          if (!isBlockExecuteRef.current && isUserFetchedRef.current && users) { 

            const firstChat = Object.values(data).filter((chat) => { !chat.hasOwnProperty("chatDeleted") }).sort((a, b) => b.date - a.data)[0]

            if (firstChat) {
              const user = users[firstChat?.userInfo?.uid]
              handleSelect(user)

              const selectedchat = currentuser.uid > user.uid ? currentuser.uid + user.uid : user.uid + currentuser.uid

              readMsg(selectedchat)
            }

            isBlockExecuteRef.current = true
          }
        }
      })
    }
    currentuser.uid && getChats()
  }, [isBlockExecuteRef.current, users])

  const readMsg = async (chatId) => {
    const chatRef = doc(db, "Chats", chatId)
    const chatDoc = await getDoc(chatRef)

    let updateMsg = chatDoc?.data()?.messages?.map((m) => {
      if (m?.read === false) {
        m.read = true
      }
      return m
    })
    await updateDoc(chatRef, {
      messages: updateMsg
    })
  }
  // const filteredChats = Object.entries(chats || {})
  // .filter(([, chat]) => !chat?.hasOwnProperty("chatDeleted"))
  // .filter(
  //     ([, chat]) =>
  //         chat?.userInfo?.displayName
  //             .toLowerCase()
  //             .includes(search.toLowerCase()) ||
  //         chat?.lastMessage?.text
  //             .toLowerCase()
  //             .includes(search.toLowerCase())
  // )
  // .sort((a, b) => b[1].date - a[1].date);

  const filterChats = Object.entries(Chats || {}).filter(([, chat]) =>  !chat.hasOwnProperty("chatDeleted") )
    .filter(([, chat]) => chat?.userInfo?.displayName.toLowerCase().includes(search.toLowerCase()) || chat.userInfo.email?.toLowerCase().includes(search.toLowerCase()) || chat?.lastMessage?.text?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b[1].date - a[1].date)

  return (
    <div className="flex flex-col h-full ml-11 mr-3">
      <div className="shrink-0 sticky -top-[20px] z-10 flex justify-center w-full bg-c2 py-5">
        <RiSearch2Line className='absolute top-9 left-12 text-c3' />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search username..'
          className='w-[300px] h-12 rounded-xl bg-c1/[0.5] pl-11 ml-9 pr-5 placeholder:text-c3 outline-none text-base'
        />
      </div>
      <ul className="flex flex-col w-full my-5 gap-[6px]">
        {Object.keys(users || {}).length > 0 && filterChats?.map((chat) => {
          const user = users[chat[1].userInfo.uid]
          const date = new Timestamp(chat[1]?.date?.seconds, chat[1]?.date?.nanoseconds).toDate()
          return (
            <li key={chat[0]} className={`h-[90px] flex items-center gap-4 rounded-3xl p-4 cursor-pointer hover:bg-c3 ${selectedChats?.uid === user?.uid ? "bg-c1" : ""}`} onClick={() => handleSelect(user, chat[0])}>
              <Avatar
                size="x-large"
                user={user && user}
              />
              <div className="flex flex-col gap-1 grow relative">
                <span className="text-base text-white flex  items-center justify-between">
                  <div className="font-medium">
                    {user?.displayName}
                  </div>
                  <div className="text-xs text-c3">
                    {formateDate(date)}
                  </div>
                </span>
                <p className="text-sm text-c3 line-clamp-1">
                  {chat[1]?.lastMessage?.text || chat[1]?.lastMessage?.img && "image" || "send your first message"}
                </p>
                {unreadMsgs?.[chat[0]]?.length && (<span className='absolute right-0 top-7 min-w-[20px] h-5 rounded-full bg-red-500 flex justify-center items-center text-sm'>
                  {unreadMsgs?.[chat[0]].length}
                </span>)}
              </div>
            </li>
          )
        })}

      </ul>
    </div>
  )
}

export default Chats