import React, { useState, useContext } from 'react'
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { UserContext } from './UserContext';
import { toast } from 'react-toastify'
import TypedText from './TypeText';

const SignUp = ({ setIsLoggedIn }) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const { setUsername: setLoggedInUsername, setId, setEmail: setLoggedEmail } = useContext(UserContext);



  const [pass, setpass] = useState(false);
  const [pass1, setpass1] = useState(false);



  async function submitHandler(event) {
    console.log("data submit");
    event.preventDefault();
    if (isLoginRegister==='register' && password != confirmPassword) {
      toast.warning('Password Doesnot Match');
      return;
    }
    try {
      console.log("api fetching..");
      const url = isLoginRegister === 'register' ? 'register' : 'login';
      console.log("check url " + url);
      const { data } = await axios.post(url, { username, password, email });

      setLoggedInUsername(username);
      setId(data.id);
      setLoggedEmail(email);
      toast.success(`Successfully ${url}`,{
        position:"top-center"
      });
      console.log(email + " " + username + " " + password);
    }
    catch (err) {
      console.log("i am in err" + err);
      if (err.response && err.response.status === 400) {

        toast.error('Email already registered',{
          position:"top-center"
        });
        return;
      }
      toast.warning('Error Occur');
    }
  }


  const [isLoginRegister, setIsLoginRegister] = useState('register');

  return (
    <div className='flex w-full h-screen'>
      <form method='post' onSubmit={submitHandler} className='flex flex-col gap-5 w-full text-white text-[18px]'>
        <div className='flex flex-col gap-3 w-8/12 mx-auto mt-[4rem]'>
          <div className='text-3xl mb-[5rem] text-yellow-400'>
            <TypedText />
          </div>
          <div className='flex gap-4'>

            <label className='w-full'>
              {
                isLoginRegister === 'register' ? (
                  <p>UserName <sup className='text-red-500 text-[14px] font-bold'>*</sup></p>
                ) :
                  (
                    <p>UserName or Email <sup className='text-red-500 text-[14px] font-bold'> *</sup></p>
                  )
              }
              <input
                className='p-2 mt-1 rounded-md border-b-2 border-b-slate-700 outline-[0.5px] w-full bg-slate-700/90'
                required
                type='text'
                name='username'
                onChange={(e) => setUsername(e.target.value)}
                placeholder='UserName'
                value={username}
                autoComplete='new-name'
              />
            </label>

          </div>
          <div>
            {
              isLoginRegister === 'register' && (
                <label className='w-full'>
                  <p>Email Address <sup className='text-red-500 text-[14px] font-bold'>*</sup></p>

                  <input
                    className='p-2 mt-1 rounded-md border-b-2 border-b-slate-700 outline-[0.5px] w-full bg-slate-700/90'
                    required
                    type='email'
                    name='email'
                    onChange={e => setEmail(e.target.value)}
                    placeholder='Enter Your Email Address'
                    value={email}
                    autoComplete='new-email'
                  />
                </label>
              )
            }
          </div>

          <div className='flex gap-4'>
            <label className='w-full relative'>
              {
                isLoginRegister === 'register' ? (
                  <p>Create Password <sup className='text-red-500 text-[14px] font-bold'>*</sup></p>
                ) :
                  (
                    <p>Password <sup className='text-red-500 text-[14px] font-bold'>*</sup></p>
                  )
              }
              <input
                className='p-2 mt-1 rounded-md border-b-2 border-b-slate-700 outline-[0.5px] w-full bg-slate-700/90'
                type={pass ? ('text') : ('password')}
                name='password'
                value={password}
                placeholder='Enter Your Password'
                required
                onChange={e => setPassword(e.target.value)}
                autoComplete='new-password'
              />
              <span className='absolute right-2 text-[22px] top-10 cursor-pointer'
                onClick={() => setpass((prev) => !prev)}>
                {pass ? (<AiOutlineEyeInvisible />) : (<AiOutlineEye />)}
              </span>
            </label>
            {
              isLoginRegister === 'register' && (
                <label className='w-full relative'>
                  <p>Confirm Password <sup className='text-red-500 text-[14px] font-bold'>*</sup></p>
                  <input
                    className='p-2 mt-1 rounded-md border-b-2 border-b-slate-700 outline-[0.5px] w-full bg-slate-700/90'
                    type={pass1 ? ('text') : ('password')}
                    name='confirmPassword'
                    value={confirmPassword}
                    placeholder='Enter Your Password'
                    required
                    onChange={e => setconfirmPassword(e.target.value)}
                  />
                  <span className='absolute right-2 text-[22px] top-10 cursor-pointer '
                    onClick={() => setpass1((prev) => !prev)}>
                    {pass1 ? (<AiOutlineEyeInvisible />) : (<AiOutlineEye />)}
                  </span>
                </label>
              )
            }

          </div>


          <div className='mt-2'>

            <button className='w-full py-2 rounded-md text-black bg-yellow-400 font-semibold'>
              {
                isLoginRegister === 'register' ? (
                  "Create Account"
                ) :
                  (
                    "Sign In"
                  )
              }

            </button>
          </div>
        </div>

        <div className='text-center'>

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
      <div className=''>
        <img className='h-full  bg-cover' src='https://assets-global.website-files.com/5ee715da7b6fbc3bf68c6bfe/64918c2270e6f03c6d5ae3b2_tutorial_building-a-jetpack-compose-chat-app.jpg' />
      </div>


    </div>
  )
}
export default SignUp