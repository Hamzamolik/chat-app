import React, { useContext,useEffect } from 'react'
import { UserContext } from '../context/authContext'
import { useRouter } from 'next/router'
import Loader from '../components/Loader'
import LeftNav from '../components/LeftNav'
import Chats from '../components/Chats'
import Chat from '../components/Chat'
import { chatProviderContext } from '../context/chatContext'

const Home = () => {
  const { currentuser, isLoading } = useContext(UserContext)
  const { data } = chatProviderContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !currentuser) {
      router.push('/login')
    }
  }, [isLoading, currentuser])

  return !currentuser ? <Loader /> : (
    <div className="bg-c1 flex h-screen">
      <div className="flex w-full shrink-0">
        <LeftNav />
        <div className="flex bg-c2 grow">

          <div className=" overflow-auto scrollbar shrink-0 border-r w-[400px] border-white/[0.05]  p-5">
            <div className="flex flex-col h-full">
              <Chats />
            </div>
          </div>
          {data.user && <Chat />}

        </div>
      </div>
    </div>
  )
}

export default Home