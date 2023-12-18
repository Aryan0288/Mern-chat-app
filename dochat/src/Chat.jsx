import React, { useContext, useEffect, useRef, useState } from 'react'
import Avatar from './Avatar';
import Logo from './Logo';
import { uniqBy } from 'lodash'
import axios from 'axios'

import { UserContext } from './UserContext';

export default function Chat() {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newMessageText, setNewMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesBoxRef=useRef();

    const { username, id } = useContext(UserContext);

    useEffect(() => {
        connectToWs();
    }, [])
    
    function connectToWs(){
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close',()=>{
            setTimeout(()=>{
                connectToWs();
            },1000);
        })
    }

    function ShowOnlinePeople(peopleArray) {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
    }


    function handleMessage(ev) {
        const messageData = JSON.parse(ev.data);
        if ('online' in messageData) {
            ShowOnlinePeople(messageData.online);
        } else if ('text' in messageData) {
            setMessages(prev => ([...prev, { ...messageData }]));
        }
    }

    function sendMessage(ev) {
        ev.preventDefault();
        console.log("sending");
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
        }));

        setNewMessageText('');
        setMessages(prev => ([...prev, {
            text: newMessageText,
            sender: id,
            recipient: selectedUserId,
            id: Date.now(),
        }]))

    }
    
    
    useEffect(()=>{
        const div= messagesBoxRef.current;
        if(div){
            div.scrollIntoView({behavior:'smooth',block:'end'});
        }
    },[messages])

    useEffect(()=>{
        if(selectedUserId){
            axios.get('/messages/'+selectedUserId).then(res=>{
                console.log("data is here "+res.data+" <-")
                setMessages(res.data);
            })
        }
    },[selectedUserId])

    const onlinePeopleExclOurUser = { ...onlinePeople };
    delete onlinePeopleExclOurUser[id];

    const messagesWithoutDupes = uniqBy(messages, '_id');

    return (
        <div className='h-screen flex'>

            <div className="bg-blue-200 w-1/3 ">

                <Logo />

                {/* {username} */}
                {
                    Object.keys(onlinePeopleExclOurUser).map(userId => (
                        <div key={userId} onClick={() => setSelectedUserId(userId)}
                            className={'border-b border-gray-100  flex items-center gap-2 cursor-pointer ' + (userId === selectedUserId ? 'bg-blue-400' : '')}>
                            {userId === selectedUserId && (
                                <div className='w-1 h-14 rounded-md bg-blue-500'></div>
                            )}

                            <div className='flex gap-2 py-2 pl-4 items-center'>
                                <Avatar username={onlinePeople[userId]} userId={userId} />
                                {
                                    console.log("all username here " + userId)
                                }
                                <span className='text-gray-800 cursor-pointer '>{onlinePeople[userId]}</span>
                            </div>
                        </div>
                    ))
                }
            </div>


            <div className="flex flex-col  bg-blue-400 w-2/3">
                <div className='flex-grow mx-2'>
                    {!selectedUserId && (
                        <div className='flex h-full flex-grow items-center justify-center'>
                            <div className='text-gray-800'>&larr; Select a person from sidebar</div>
                        </div>
                    )}

                    {!!selectedUserId && (
                        <div className='relative h-full'>
                            <div  className='overflow-y-scroll absolute inset-0 ml-4 pr-5'>
                                {messagesWithoutDupes.map(message => (
                                    <div className={(message.sender === id ? 'text-right' : 'text-left')}>
                                        <div key={message}
                                            className={"inline-block py-[5px] px-4 my-3 rounded-md text-sm " + (message.sender === id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white')}
                                        >{message.text}</div>
                                    </div>
                                ))}
                            <div ref={messagesBoxRef}></div>
                            </div>
                        </div>
                    )}
                </div>


                {!!selectedUserId && (
                    <form onSubmit={sendMessage} className='flex gap-2 mx-2 p-2'>
                        <input type='text'
                            value={newMessageText}
                            onChange={ev => setNewMessageText(ev.target.value)}
                            placeholder='type your message here'
                            className='bg-white flex-grow border p-2 rounded-md' />

                        <button type='submit' className='bg-blue-500 p-2 text-white rounded-md'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>

                    </form>

                )}

            </div>
        </div>
    )
}
