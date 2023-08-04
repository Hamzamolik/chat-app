import React, { useContext } from 'react'
import { UserContext } from '../context/authContext'
import { BiEdit, BiCheck } from 'react-icons/bi'
import { BsFillCheckCircleFill } from 'react-icons/bs'
import { FiPlus } from 'react-icons/fi'
import { IoLogOutOutline, IoClose } from 'react-icons/io5'
import { uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage'
import { MdPhotoCamera, MdAddAPhoto, MdDeleteForever } from 'react-icons/md'
import { profileColors } from '../utils/constants'
import Avatar from './Avatar'
import Icon from './Icon'
import { useState } from 'react'
import { toast } from 'react-toastify'
import ToastMessage from './ToastMessage'
import { doc, updateDoc } from 'firebase/firestore'
import { db, auth, storage } from '../firebase/firebase'
import { updateProfile } from 'firebase/auth'
import UsersPopup from './popup/UsersPopup'

const LeftNav = () => {

    const editProfileContainer = () => {
        const authuser = auth.currentUser

        const UploadImageToFirebase = (file) => {
            if (file) {
                //file uploading logic
                const storageRef = ref(storage, authuser.displayName);
                const uploadTask = uploadBytesResumable(storageRef, file);


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
                            console.log('File available at', downloadURL);
                            handleUpdateProfile("photo", downloadURL)
                            await updateProfile(authuser, { photoURL: downloadURL })
                        });
                    }
                );
            }
        }

        const handleUpdateProfile = (type, value) => {
            //color,name,photo,photo-remove
            let obj = { ...currentuser }
            switch (type) {
                case "color":
                    obj.color = value
                    break;

                case "name":
                    obj.displayName = value
                    break;

                case "photo":
                    obj.photoURL = value
                    break;

                case "photo-remove":
                    obj.photoURL = null
                    break;

                default:
                    break;
            }

            try {
                toast.promise(async () => {
                    const userDocRef = doc(db, "users", currentuser.uid)
                    await updateDoc(userDocRef, obj)
                    setCurrentuser(obj)

                    if (type === "photo-remove") {
                        await updateProfile(authuser, { photoURL: null })
                        console.log(currentuser)
                    }

                    else if (type === "name") {
                        await updateProfile(authuser, { displayName: value })
                        setNameEdited(false)
                    }



                }, {
                    pending: 'Updating Profile',
                    success: 'Profile updated successfully',
                    error: 'process fail'
                }, {
                    autoClose: 5000
                })
            } catch (error) {
                console.error(error)
            }
        }

        let a = currentuser.displayName.split(' ')
        const Onkeyup = (e) => {
            if (e.target.innerText.trim() !== currentuser.displayName) {
                //name is editted
                setNameEdited(true)
            }
            else {
                //name is not editted
                setNameEdited(false)
            }
        }
        const Onkeydown = (e) => {
            if (e.key === "Enter" && e.keyCode === 13) {
                e.preventDefault()
            }
        }
        return (
            <div className="relative flex flex-col items-center">
                <ToastMessage />
                <Icon
                    icon={<IoClose size={20} />}
                    size="small"
                    className="absolute top-0 right-5 hover:bg-c2"
                    onClick={() => setEditProfile(false)}
                />

                <div className="relative group cursor-pointer">
                    <Avatar
                        user={currentuser}
                        size="xx-large"
                    />
                    <div className="w-full h-full rounded-full bg-black/[0.5] absolute top-0 left-0 justify-center items-center hidden group-hover:flex">
                        <label htmlFor="uploadfile">
                            {currentuser?.photoURL ? (
                                <MdPhotoCamera size={34} />
                            ) : (
                                <MdAddAPhoto size={34} />
                            )}
                        </label>
                    </div>
                    {currentuser.photoURL && <div className="w-6 h-6 rounded-full bg-red-500 flex absolute justify-center items-center right-0 bottom-0" >
                        <MdDeleteForever size={34} onClick={() => handleUpdateProfile("photo-remove")} />
                    </div>}

                </div>


                <input
                    id='uploadfile'
                    className='hidden cursor-pointer'
                    type="file"
                    onChange={(e) => UploadImageToFirebase(e.target.files[0])}
                />
                <div className="items-center mt-5 flex flex-col">
                    <div className="flex items-center gap-2">

                        {!nameEdited && <BiEdit className='text-c3' />}

                        {nameEdited && <BsFillCheckCircleFill
                            className='text-c4 cursor-pointer'
                            onClick={() => { handleUpdateProfile("name", document.getElementById('displayNameEdit').innerText) }}
                        />}
                        <div
                            contentEditable
                            className='bg-transparent outline-none border-none text-center'
                            id='displayNameEdit'
                            onKeyUp={Onkeyup}
                            onKeyDown={Onkeydown}
                        >
                            {a[0]?.charAt(0).toUpperCase() + a[0]?.slice(1) + ' ' + a[1]?.charAt(0).toUpperCase() + a[1]?.slice(1) + ' ' + a?.slice(2)}
                        </div>
                    </div>
                    <span className='text-c3 text-sm'>{currentuser.email}</span>
                </div>
                <div className="grid grid-cols-5 gap-4 mt-5">
                    {profileColors.map((color, index) => (
                        <span
                            key={index}
                            className='w-10 h-10 rounded-full items-center justify-center flex cursor-pointer transition-transform hover:scale-125'
                            style={{ backgroundColor: color }}
                            onClick={() => { handleUpdateProfile("color", color) }}
                        >
                            {color === currentuser.color && < BiCheck size={24} />}
                        </span>
                    ))}
                </div>
            </div >
        )
    }
    const [editProfile, setEditProfile] = useState(false)
    const [nameEdited, setNameEdited] = useState(false)
    const [UserPopup, setUserPopup] = useState(false)
    const { currentuser, signOut, setCurrentuser } = useContext(UserContext)
    return (
        <div className={`${editProfile ? "w-[350px]" : "w-[80px] items-center"} pl-1  justify-between flex text-white flex-col py-5 shrink-0 transition-all relative`}>
            {editProfile ? editProfileContainer() : (
                <div onClick={() => setEditProfile(true)} className="relative group cursor-pointer">
                    <Avatar size="large" user={currentuser} />
                    <div className="w-full h-full rounded-full bg-black/[0.5] absolute top-0 left-0 justify-center items-center group-hover:flex hidden">
                        <BiEdit size={14} />
                    </div>
                </div>
            )}

            <div className={`flex gap-5 ${editProfile ? "ml-5" : "flex-col items-center"}`}>
                <Icon size="x-large"
                    className="bg-green-500 hover:bg-gray-600"
                    icon={<FiPlus size={24} />}
                    onClick={() => setUserPopup(!UserPopup)}
                />
                <Icon size="x-large"
                    className='hover:bg-c2 focus:ring-2 ring-c2 p-1'
                    icon={<IoLogOutOutline size={24} />}
                    onClick={signOut}
                />
            </div>
            {UserPopup && <UsersPopup onHide={() => setUserPopup(false)} title="Find Users" />}

        </div >
    )
}

export default LeftNav

