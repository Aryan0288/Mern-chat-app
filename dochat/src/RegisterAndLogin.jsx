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
import { toast } from 'react-toastify'

export default function Register() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginRegister, setIsLoginRegister] = useState('register');

    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);


    // async function sumbmitHandler(event) {
    //     console.log("data submit");
    //     event.preventDefault();
    //     try {
    //         const url = isLoginRegister === 'register' ? 'register' : 'login';
    //         const { data } = await axios.post(url, { username, password });
    //         setLoggedInUsername(username);
    //         setId(data.id);
    //         toast.success(`Successfully ${url}`);
    //     }
    //     catch (err) {
    //         toast.warning('Error Occur');

    //     }


    // }

    console.log("i am register file");
    return (
        <div className='bg-blue-50 h-screen flex items-center'>
            <form method='post' className='w-64 mx-auto mb-12 ' onSubmit={sumbmitHandler}>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type='email'
                    placeholder='Email'
                    className='block p-2 mb-2 w-full' />
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


                <button className='bg-blue-500 text-white w-full  rounded-sm py-2'>
                    {isLoginRegister === 'register' ? 'Register' : 'Login'}
                </button>

                <div className='text-center mt-2'>

                    {
                        isLoginRegister === 'register' &&
                        (
                            <div>
                                Already a member?
                                < button onClick={() => setIsLoginRegister('login')}>&nbsp; Login here</button>
                            </div>
                        )
                    }

                    {
                        isLoginRegister === 'login' &&
                        (
                            <div>
                                Don't have an account?
                                < button onClick={() => setIsLoginRegister('register')}> &nbsp;Register </button>
                            </div>
                        )
                    }
                </div>
            </form>
        </div>
    )
}

