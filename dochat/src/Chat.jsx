import React, { useContext, useEffect, useRef, useState } from 'react'
import Avatar from './Avatar';
import Logo from './Logo';
import { uniqBy } from 'lodash'
import axios from 'axios'

import { UserContext } from './UserContext';
import Contact from './Contact';

export default function Chat() {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [offlinePeople, setOfflinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newMessageText, setNewMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageId, setMessagesId] = useState("");

    const messagesBoxRef = useRef();
    const { username, id, setId, setUsername } = useContext(UserContext);

    useEffect(() => {
        connectToWs();
        console.log("this is ws connector");
    }, [selectedUserId])

    function connectToWs() {
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', () => {
            setTimeout(() => {
                connectToWs();
            }, 1000);
        })
    }

    function ShowOnlinePeople(peopleArray) {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {

            if (username) {
                people[userId] = username;
            }
        });
        setOnlinePeople(people);
    }


    function handleMessage(ev) {
        const messageData = JSON.parse(ev.data);
        if ('online' in messageData) {
            ShowOnlinePeople(messageData.online);
        } else if ('text' in messageData) {
            if (messageData.sender === selectedUserId) {
                setMessages(prev => ([...prev, { ...messageData }]));
            }
        }
    }

    function logout() {
        axios.post('/logout').then(() => {
            setWs(null);
            setId(null);
            setUsername(null);
        })
        console.log("Logout");
    }

    // Handle the send files
    async function sendMessage(ev, file = null) {
        
        if (ev) ev.preventDefault();

        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
            file,
        }));

        setNewMessageText('');
        setMessages(prev => ([...prev, {
            text: newMessageText,
            sender: id,
            recipient: selectedUserId,
            _id: Date.now(),
        }]));

        if (file) {
            axios.get('/messages/' + selectedUserId).then(res => {
                setMessages(res.data);
            })
        } else {
            setNewMessageText('');
            setMessages(prev => ([...prev, {
                text: newMessageText,
                sender: id,
                recipient: selectedUserId,
                _id: Date.now(),
            }]));
        }


    }

    // file send function
    function sendFile(ev) {
        const reader = new FileReader();
        reader.readAsDataURL(ev.target.files[0]);
        reader.onload = () => {
            sendMessage(null, {
                name: ev.target.files[0].name,
                data: reader.result,
            })
        }
    }

    async function getFetch() {
        console.log("I am in fetch fnc");
        const currentUserId = selectedUserId;
        console.log("deleted");
    }
    
    useEffect(()=>{
        console.log("I am in useEffect getfetch");
        getFetch();
    },[sendMessage]);
    
    
    const handleDelete = async (mess) => {
        
        try {
            
            setMessagesId(mess._id);
            console.log(messages.length);
            const filteredPeople = messages.filter((item) => item._id !== mess._id);
            setMessages(filteredPeople);
            // sendMessage(null,null);
            const response = await axios.delete(`/messages/${mess._id}`);
        } catch (error) {
            console.error(error);
        }
    };





    useEffect(() => {
        const div = messagesBoxRef.current;
        if (div) {
            div.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages])




    useEffect(() => {
        // console.log("new fetch api here");
        axios.get('/people').then(res => {
            const offlinePeopleArr = res.data
                .filter(p => p._id !== id)
                .filter(p => !Object.keys(onlinePeople).includes(p._id));

            const offlinePeople = {};
            offlinePeopleArr.forEach(p => {
                offlinePeople[p._id] = p;
            })
            // console.log(offlinePeople);
            setOfflinePeople(offlinePeople);
        });
    }, [id, onlinePeople]);

    useEffect(() => {
        if (selectedUserId) {
            axios.get('/messages/' + selectedUserId).then(res => {
                // console.log("data is here " + res.data + " <-")
                setMessages(res.data);
            })
        }
    }, [selectedUserId])

    const onlinePeopleExclOurUser = { ...onlinePeople };
    delete onlinePeopleExclOurUser[id];
    const messagesWithoutDupes = uniqBy(messages, '_id');
    return (
        <div className='h-screen flex'>

            <div className="bg-blue-200 w-1/3 flex flex-col justify-between">



                <div className='flex-grow'>
                    <Logo />
                    {
                        Object.keys(onlinePeopleExclOurUser).map(userId => (
                            <Contact

                                key={userId}
                                id={userId}
                                online={true}
                                username={onlinePeopleExclOurUser[userId]}
                                onClick={() => setSelectedUserId(userId)}
                                selected={userId === selectedUserId}
                            />

                        ))
                    }

                    {
                        Object.keys(offlinePeople).map(userId => (
                            <Contact
                                key={userId}
                                id={userId}
                                online={false}
                                username={offlinePeople[userId].username}
                                onClick={() => setSelectedUserId(userId)}
                                selected={userId === selectedUserId}
                            />
                        ))
                    }
                </div>
                <div onClick={logout} className='flex items-center justify-center p-2'>
                    <div className=''>
                        {username}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 p-2 cursor-pointer bg-gray-200">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
                    </svg>

                    <button className='text-md  text-gray-600 font-medium bg-gray-200 p-2'>Sign out</button>
                </div>
            </div>


            <div className="flex flex-col bg-blue-400 w-2/3">
                <div className='flex-grow mx-2'>
                    {!selectedUserId && (
                        <div className='flex h-full flex-grow items-center justify-center'>
                            <div className='text-gray-800'>&larr; Select a person from sidebar</div>
                        </div>
                    )}

                    {!!selectedUserId && (
                        <div className='relative h-full'>
                            <div className='overflow-y-scroll absolute inset-0 ml-4 pr-5'>

                                {messagesWithoutDupes.map(message => (
                                    <div key={message._id} className={(message.sender === id ? 'text-right' : 'text-left')}>
                                        <div className={"inline-block text-[13px] py-1  px-4 my-3 rounded-md text-sm cursor-text " + (message.sender === id ? 'bg-blue-600 max-w-[64%] text-white' : 'bg-gray-700 text-white mb-2')}
                                        >
                                            <div className='flex py-[6x]  items-center justify-center text-left'>
                                                <span className='cursor-pointer text-black ' onClick={() => handleDelete(message)}>delete</span>
                                                {message.text}
                                            </div>
                                            <div>
                                                {
                                                    message.file && (
                                                        <div>
                                                            <a target="_blank" className='flex items-center justify-center ' href={axios.defaults.baseURL + '/uploads/' + message.file}>
                                                                {message.file}
                                                            </a>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesBoxRef}></div>
                            </div>
                        </div>
                    )}
                </div>


                {!!selectedUserId && (
                    <form onSubmit={sendMessage} className='flex items-center gap-2 mx-2 p-2'>
                        <input type='text'
                            value={newMessageText}
                            onChange={ev => setNewMessageText(ev.target.value)}
                            placeholder='type your message here'
                            className='bg-white flex-grow border p-2 rounded-md' />
                        <label className='cursor-pointer'>
                            <input type='file' className='hidden' onChange={sendFile} />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                            </svg>
                        </label>
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
