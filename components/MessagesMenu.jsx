import React, { useEffect, useRef } from 'react'
import ClickAwayListener from 'react-click-away-listener'

const MessagesMenu = ({ setShowMenu, showMenu, self, setDeleteMenu,seteditMsg }) => {
    const handleclickAway = () => {
        setShowMenu(false)
    }
    const ref = useRef()

    useEffect(() => {
        ref?.current?.scrollIntoViewIfNeeded()
    }, [])

    return (
        <ClickAwayListener onClickAway={handleclickAway}>
            <div ref={ref} className={`w-[200px] absolute top-8 ${self ? "right-0" : "left-0"} bg-c0 z-10 rounded-md overflow-hidden`}>
                <ul className='flex flex-col py-2'>
                    {self && <li className="flex items-center py-3 px-5 hover:bg-black cursor-pointer"
                    onClick={(e)=>{
                        e.stopPropagation()
                        seteditMsg()
                        setShowMenu(false)
                    }}
                    >
                        Edit Message
                    </li>}
                    <li className="flex items-center py-3 px-5 hover:bg-black cursor-pointer" onClick={() => {
                        setDeleteMenu(true)
                        setShowMenu(false)
                    }}>
                        Delete Message
                    </li>
                </ul>
            </div>
        </ClickAwayListener>
    )
}

export default MessagesMenu