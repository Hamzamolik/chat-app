import { createContext, useState, useContext, useEffect, useReducer } from "react";
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from "./authContext";

const chatContext = createContext()

export const ChatContextProvider = ({ children }) => {
    const [users, setusers] = useState(false)
    const [Chats, setChats] = useState([])
    const [selectedChats, setSelectedChats] = useState(null)
    const [inputText, setInputText] = useState('')
    const [attachment, setAttachment] = useState(null)
    const [attachmentPreview, setAttachmentPreview] = useState(null)
    const [editMsg, seteditMsg] = useState(null)
    const [isTyping, setIsTyping] = useState(null)
    const [imageviewer, setImageviewer] = useState(null)
    const {currentuser}=useAuth()


    const INITIAL_STATE = {
        ChatId:"",
        user:null
    }

    const resetFooterState=()=>{
        setInputText('')
        setAttachment(null)
        setAttachmentPreview(null)
        setImageviewer(null)
        seteditMsg(null)
    }

    const chatReducer=(state,action)=>{
        switch (action.type) {
            case "CHANGE_USER":
                return {
                    user:action.payload,
                    chatId:currentuser.uid > action.payload.uid ?currentuser.uid +action.payload.uid :action.payload.uid+currentuser.uid
                }
            case "EMPTY":
                return INITIAL_STATE
        
            default:
                return state
        }

    }

    const [state,dispatch] = useReducer(chatReducer,INITIAL_STATE)

    useEffect(() => {
        onSnapshot(collection(db, "users"), (snapshot) => {
            const UpdatedUser = {}
            snapshot.forEach((doc) => {
                UpdatedUser[doc.id] = doc.data()
            })
            setusers(UpdatedUser)
        })

    }, [])


    return (
        <chatContext.Provider value={{
            users,setusers,
            data:state,dispatch,
            Chats, setChats,
            selectedChats, setSelectedChats,
            inputText, setInputText,
            attachment, setAttachment,
            attachmentPreview, setAttachmentPreview,
            editMsg, seteditMsg,
            isTyping, setIsTyping,
            imageviewer, setImageviewer,
            resetFooterState
        }}>
            {children}
        </chatContext.Provider>
    )
}

export const chatProviderContext = () => useContext(chatContext)

// export { chatContext, ChatContextProvider }