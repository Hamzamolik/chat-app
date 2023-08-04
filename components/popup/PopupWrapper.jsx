import React from 'react'
import Icon from '../Icon'
import { IoClose } from 'react-icons/io5'
const PopupWrapper = ({ children, title, onHide ,noHeader,shortHeight}) => {
    return (
        <div className='fixed top-0 left-0 flex items-center justify-center w-full h-full z-20 '>
            <div className="w-full h-full absolute  glass-effect" onClick={onHide} />
            <div className={`flex flex-col w-[300px] md:w-[500px] max-h-[80%]  bg-c2 relative z-10 rounded-3xl ${shortHeight ?"":"min-h-[600px]"}`}>
                {!noHeader && <div className="shrink-0 p-6 flex items-center justify-between">
                    <div className="text-lg font-semibold">
                        {title || ""}
                    </div>
                    <Icon
                        size="small"
                        icon={<IoClose size={20} />}
                        onClick={onHide}
                    />
                </div>}
                <div className="grow flex flex-col p-6 pt-0">
                    {children}
                </div>
            </div>

        </div>
    )
}

export default PopupWrapper
