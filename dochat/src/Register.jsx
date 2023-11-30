// import React from 'react'

// export default function Register() {
//   return (
//     <div>

//     </div>
//   )
// }

import React, { useContext, useState } from 'react'
import axios from 'axios';
import { UserContext } from './UserContext';
export default function Register() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {setUsername:setLoggedInUsername,setId}=useContext(UserContext);
    async function register(event) {
        console.log("data submit");
        event.preventDefault();
        await axios.post('/register', { username, password });
    }
    console.log("i am register file");
    return (
        <div className='bg-blue-50 h-screen flex items-center'>
            <form method='post' className='w-64 mx-auto mb-12 ' onSubmit={register}>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type='text'
                    placeholder='username'
                    className='block p-2 mb-2 w-full' />
                <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type='password'
                    placeholder='password'
                    className='block p-2 mb-2 w-full' />
                <button className='bg-blue-500 text-white w-full  rounded-sm py-2'>Register</button>
            </form>
        </div>
    )
}

