import React from 'react'

export default function Avatar({userId,username}) {
    const firstLetter = username ? username[0].toUpperCase() : '';
    const colors=['bg-red-200','bg-green-200','bg-purple-200','bg-blue-200','bg-yellow-200','bg-teal-200']
    
    const userBase10=parseInt(userId,16);
    const colorIndex=userBase10 % colors.length;

    const color=colors[colorIndex];
    console.log("color is "+color);
    return (
    <div className={'w-8 h-8 rounded-full text-center flex items-center '+color}>
        <div className='text-center w-full'>{firstLetter}</div>
    </div>
  )
}
