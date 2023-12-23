import React from 'react'

export default function Avatar({userId,username,online}) {
    const firstLetter = username ? username[0].toUpperCase() : '';
    const colors=['bg-red-200','bg-green-200','bg-purple-200','bg-blue-200','bg-yellow-200','bg-teal-200']
    
    const userBase10=parseInt(userId.substring(10),16);
    const colorIndex=userBase10 % colors.length;

    const color=colors[colorIndex];
    // console.log("color is "+color);
    return (
    <div className={'w-8 h-8 relative rounded-full text-center flex items-center '+color}>
        <div className='text-center w-full'>{firstLetter}</div>
        { online && (
          <div className='absolute w-3 h-3 bg-green-400 -bottom-[2px] -right-[2px] border border-white shadow-lg shadow-black  rounded-full'></div>
        )}
        { !online && (
          <div className='absolute w-3 h-3 bg-gray-400 -bottom-[2px] -right-[2px] border border-white shadow-lg shadow-black  rounded-full'></div>
        )}
    </div>
  )
}
