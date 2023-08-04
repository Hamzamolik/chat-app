import React, { useEffect } from 'react'
import { chatProviderContext } from '../context/chatContext'
import { TbSend } from 'react-icons/tb'
import { v4 as uuid } from 'uuid'
import { Timestamp, arrayUnion, deleteField, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, storage } from '../firebase/firebase'
import { useAuth } from '../context/authContext'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'

let typingTimeOut = null;
const Composebar = () => {
  const { currentuser } = useAuth()
  const { data, attachment, setAttachment,
    setAttachmentPreview } = chatProviderContext()
  const { inputText, setInputText, seteditMsg, editMsg } = chatProviderContext()

  useEffect(() => {
    setInputText(editMsg?.text || "")
  }, [editMsg])


  const onKeyUp = (e) => {
    if (e.key == "Enter" && (inputText.length > 0 || attachment)) {
      editMsg ? handleEdit() : handlesend()
    }
  }

  const handleEdit = async () => {
    try {
      const messageID = editMsg.id;
      const chatRef = doc(db, "Chats", data.chatId);

      // Retrieve the chat document from Firestore
      const chatDoc = await getDoc(chatRef);

      if (attachment) {
        const storageRef = ref(storage, uuid());
        const uploadTask = uploadBytesResumable(storageRef, attachment);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) *
              100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            console.error(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(
              async (downloadURL) => {
                // Create a new "messages" array that excludes the message with the matching ID
                let updatedMessages = chatDoc
                  ?.data()
                  ?.messages?.map((message) => {
                    if (message.id === messageID) {
                      message.text = inputText;
                      message.img = downloadURL;
                    }
                    return message;
                  });

                await updateDoc(chatRef, {
                  messages: updatedMessages,
                });
              }
            );
          }
        );
      } else {
        // Create a new "messages" array that excludes the message with the matching ID
        let updatedMessages = chatDoc.data().messages.map((message) => {
          if (message.id === messageID) {
            message.text = inputText;
          }
          return message;
        });
        await updateDoc(chatRef, { messages: updatedMessages });
      }

      setInputText("");
      setAttachment(null);
      setAttachmentPreview(null);
      seteditMsg(null);
    } catch (err) {
      console.error(err);
    }
  };
  const handlesend = async () => {

    if (attachment) {
      //file uploading logic
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, attachment);


      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          console.error(error)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "Chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text: inputText,
                sender: currentuser.uid,
                date: Timestamp.now(),
                read: false,
                img: downloadURL
              })
            })
          });
        }
      );
    } else {

      await updateDoc(doc(db, "Chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text: inputText,
          sender: currentuser.uid,
          date: Timestamp.now(),
          read: false
        })
      })
    }

    let msg = { text: inputText }

    if (attachment) {
      msg.img = true
    }

    await updateDoc(doc(db, "userChats", currentuser.uid), {
      [data.chatId + ".lastMessage"]: msg,
      [data.chatId + ".date"]: serverTimestamp()
    })

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: msg,
      [data.chatId + ".date"]: serverTimestamp(),
      [data.chatId + ".chatDeleted"]: deleteField()
    })

    setInputText("")
    setAttachment(false)
    setAttachmentPreview(false)
  }

  const handleTyping = async (e) => {
    setInputText(e.target.value)
    await updateDoc(doc(db, "Chats", data.chatId), {
      [`typing.${currentuser.uid}`]: true
    })
    typingTimeOut = setTimeout(async () => {
      await updateDoc(doc(db, "Chats", data.chatId), {
        [`typing.${currentuser.uid}`]: false
      })
      if (typingTimeOut) {
        clearTimeout(typingTimeOut)
      }
      typingTimeOut = null
    }, 500)
  }
  return (
    <div className='flex items-center gap-2 grow'>
      <input
        type="text"
        placeholder='Type a message'
        className='grow w-full outline-0 px-2 py-2 text-white bg-transparent placeholder:text-c3 outline-none text-base'
        value={inputText}
        onChange={handleTyping}
        onKeyUp={onKeyUp}
      />
      <button className={`h-10 w-10 rounded-xl shrink-0 flex justify-center items-center ${inputText.trim().length > 0 ? "bg-c4" : ""}`} onClick={editMsg ? handleEdit : handlesend}>
        <TbSend size={20} className='text-white' />
      </button>
    </div>
  )
}

export default Composebar