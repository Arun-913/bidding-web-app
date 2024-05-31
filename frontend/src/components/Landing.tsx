import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {io} from 'socket.io-client';

const socket = io("http://localhost:8000");

type getAllItemsSchema = {
    id: number,
    user_id: number,
    name: string,
    description: string,
    starting_price: number,
    current_price: number,
    image_url: null | string,
    end_time: Date,
    created_at: Date
}

type recentMessageSchema = {
    message: string,
    item_name: string,
    item_id: number
}

export const Landing = () =>{
    const [error, setError] = useState<string>('');
    const [auctions, setAuctions] = useState<Array<getAllItemsSchema>>([]);
    // const [bidAmount, setBidAmount] = useState<number>(0);
    const [bidAmounts, setBidAmounts] = useState<{[key: number]: number}>({});
    const [authToken, setAuthToken] = useState<string>('');
    const [recentMessage, setRecentMessage] = useState<recentMessageSchema | null>(null);
    const navigate = useNavigate();


    const handleGetAllItems = async()=>{
        try{
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/items`);
            console.log(response);
            setAuctions(response.data.items);

            const initialBidAmounts: {[key: number]: number} = {};
            response.data.items.forEach((item: getAllItemsSchema) => {
                initialBidAmounts[item.id] = 0;
            });
            setBidAmounts(initialBidAmounts);
        }
        catch(error){
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response && axiosError.response.status === 401) {
                    // @ts-ignore
                    if(axiosError.response.data.message){
                        // @ts-ignore
                        setError(axiosError.response.data.message);
                    }
                    else{
                        // @ts-ignore
                        setError(axiosError.response.data.issues[0].message);
                    }
                } else {
                    setError('An error occurred while processing your request. Please try again later.');
                }
            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
            console.error(error);
        }
    }
    
    const handlePlaceBid = async (item_id:number, item_name:string) =>{
        try{
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/items/${item_id}/bids`,
                {
                    bid_amount: bidAmounts[item_id]
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );
            // console.log(response);
            if(response.status === 201){
                alert('Bid has been palced');
                setBidAmounts(prevState => ({
                    ...prevState,
                    [item_id]: 0
                }))
                
                handleGetAllItems();

                socket.emit('send-message', {
                    message: `New Bid has been palced`,
                    item_name,
                    item_id
                });
            }
        }
        catch(error){
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response && axiosError.response.status === (400 || 500)) {
                    // @ts-ignore
                    if(axiosError.response.data.message){
                        // @ts-ignore
                        setError(axiosError.response.data.message);
                    }
                    else{
                        // @ts-ignore
                        setError(axiosError.response.data.issues[0].message);
                    }
                } else {
                    setError('An error occurred while processing your request. Please try again later.');
                }
            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
            console.error(error);
        }
    }

    useEffect(()=>{
        socket.on('receive-message', (data)=>{
            console.log(data);
            setRecentMessage(data);
        });

        return () => {
            socket.off('receive-message');
        };
    },[socket])

    useEffect(() =>{
        const authToken = Cookies.get('authToken');
        if(!authToken){
            navigate('/register');
        }
        // @ts-ignore
        setAuthToken(authToken);

        handleGetAllItems();
    }, [])

    return (
        <div>
            <div className="w-screen flex justify-center items-center text-3xl bg-gray-300 rounded-lg h-auto">
                <div className="font-bold ">Recent Message: &nbsp; </div>
                {recentMessage !== null ? 
                    <div>{`New has been placed on ITEM ${recentMessage.item_name} and its ID is ${recentMessage.item_id}`}</div>:
                    <div>No recent message</div>
                }
            </div>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Auction List</h1>
                <ul>
                    {auctions.map(auction => (
                        <li key={auction.id} className="border-b py-4">
                            <div><span className="font-bold">Name:</span> {auction.name}</div>
                            <div><span className="font-bold">Description:</span> {auction.description}</div>
                        <div><span className="font-bold">Starting Price:</span> {auction.starting_price}</div>
                            <div><span className="font-bold">Current Price:</span> {auction.current_price}</div>
                            <div><span className="font-bold">End Time:</span> {new Date(auction.end_time).toLocaleString()}</div>
                            <div><span className="font-bold">Created At:</span> {new Date(auction.created_at).toLocaleString()}</div>
                            <div>
                                <input 
                                    type="number"
                                    placeholder="Enter amount"
                                    className="border-black border-2 p-1 rounded-lg"
                                    value={bidAmounts[auction.id]}
                                    onChange={e => setBidAmounts(prevState => ({
                                        ...prevState,
                                        [auction.id]: parseFloat(e.target.value)
                                    }))}
                                />
                            </div>
                            <button
                                className="h-14 text-lg rounded-lg border-2 m-6 p-3 w-30 bg-slate-500" 
                                style={{color:"white"}} 
                                type="submit"
                                disabled={bidAmounts[auction.id] <= auction.current_price}
                                onClick={() => handlePlaceBid(auction.id, auction.name)}
                            >Place Bids</button>
                        </li>
                    ))}
                </ul>
            </div>
                
            {error && <p className="text-red-500">{error}</p>}
        </div>
    )
}