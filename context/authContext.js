import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as authsignOut } from 'firebase/auth'
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const UserContext = createContext()

const UserProvider = ({ children }) => {
    const [currentuser, setCurrentuser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const clear = async () => {
        try {
            if (currentuser) {
                await updateDoc(doc(db, "users", currentuser?.uid), {
                    isOnline: false
                })
            }
            setCurrentuser(null)
            setIsLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    const authStateChange = async (user) => {
        setIsLoading(true)
        if (!user) {
            clear()
            return;
        }
        getDoc(doc(db, "users", user.uid)).then((userDoc) => {
            setCurrentuser(userDoc?.data())
        })

        const userDocExists = await getDoc(doc(db, "users", user.uid))
        if (userDocExists.exists()) {
            await updateDoc(doc(db, "users", user?.uid), {
                isOnline: true
            })
        }
        setIsLoading(false)
    }

    const signOut = () => {
        authsignOut(auth).then(() => {
            clear()
        })
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, authStateChange)

        return () => unsubscribe()
    }, [])


    return (
        <UserContext.Provider value={{
            currentuser, setCurrentuser,
            isLoading, setIsLoading,
            signOut
        }} >
            {children}
        </UserContext.Provider>
    )
}
export const useAuth = () => useContext(UserContext)
export { UserContext, UserProvider }