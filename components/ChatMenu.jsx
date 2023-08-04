import { useAuth } from "../context/authContext";
import { chatProviderContext } from "../context/chatContext";
import { db } from "../firebase/firebase";
import {
    arrayRemove,
    arrayUnion,
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import ClickAwayListener from "react-click-away-listener";

const ChatMenu = ({ setShowMenu, showMenu }) => {
    const { data, users, dispatch, Chats, setSelectedChats } = chatProviderContext();
    const { currentuser } = useAuth();

    const isUserBlocked = users[currentuser.uid]?.blockedUsers?.find(
        (u) => u === data.user.uid
    );

    const IamBlocked = users[data.user.uid]?.blockedUsers?.find(
        (u) => u === currentuser.uid
    );

    const handleClickAway = () => {
        setShowMenu(false);
    };

    const handleBlock = async (type) => {
        if (type === "block") {
            await updateDoc(doc(db, "users", currentuser.uid), {
                blockedUsers: arrayUnion(data.user.uid),
            });
        }
        if (type === "unblock") {
            await updateDoc(doc(db, "users", currentuser.uid), {
                blockedUsers: arrayRemove(data.user.uid),
            });
        }
    };

    const handleDelete = async () => {
        try {
            const chatRef = doc(db, "Chats", data?.chatId);

            // Retrieve the chat document from Firestore
            const chatDoc = await getDoc(chatRef);

            // Create a new "messages" array that excludes the message with the matching ID
            const updatedMessages = chatDoc?.data()?.messages?.map((message) => {
                message.deleteChatInfo = {
                    ...message.deleteChatInfo,
                    [currentuser.uid]: true,
                };
                return message;
            });

            // Update the chat document in Firestore with the new "messages" array
            await updateDoc(chatRef, { messages: updatedMessages });

            await updateDoc(doc(db, "userChats", currentuser.uid), {
                [data.chatId + ".chatDeleted"]: true,
            });

            const filteredChats = Object.entries(Chats || {})
                .filter(([id, chat]) => id !== data.chatId)
                .sort((a, b) => b[1]?.date - a[1]?.date);

            if (filteredChats.length > 0) {
                setSelectedChats(filteredChats?.[0]?.[1]?.userInfo);
                dispatch({
                    type: "CHANGE_USER",
                    payload: filteredChats[0][1].userInfo,
                });
            } else {
                dispatch({ type: "EMPTY" });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <div
                className={`w-[200px] absolute top-[70px] right-5 bg-c0 z-10 rounded-md overflow-hidden`}
            >
                <ul className="flex flex-col py-2">
                    {!IamBlocked && (
                        <li
                            className="flex items-center py-3 px-5 hover:bg-black cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleBlock(
                                    isUserBlocked ? "unblock" : "block"
                                );
                            }}
                        >
                            {isUserBlocked ? "Unblock" : "Block user"}
                        </li>
                    )}
                    <li
                        className="flex items-center py-3 px-5 hover:bg-black cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                            setShowMenu(false);
                        }}
                    >
                        Delete chat
                    </li>
                </ul>
            </div>
        </ClickAwayListener>
    );
};

export default ChatMenu;
