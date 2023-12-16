import React, { useContext } from 'react'
// import Register from './RegisterAndLogin.jsx';
import { UserContext } from './UserContext.jsx';
import SignUp from './SignUp.jsx';
import Chat from './Chat.jsx';
export default function Routes() {
  const {username,id}=useContext(UserContext);

  if(username){
    return <Chat/>;
  }

  return (
    // <Register/>
    <div className='bg-[#000814]'>
      <SignUp/>
    </div>
  )
}