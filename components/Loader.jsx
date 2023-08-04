import React from 'react'
import Image from 'next/image'

const Loader = () => {
    return (
        <div className="items-center justify-center flex h-full w-full left-0 top-0 fixed bg-c3">
            <Image
                src='/loader.svg'
                alt='loading...'
                width={100}
                height={100}
            />
        </div>
    )
}

export default Loader