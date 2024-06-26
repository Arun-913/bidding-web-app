import { useState } from "react";
import axios, { AxiosError } from "axios";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";

export const Register = () =>{
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [role, setRole] = useState<string>('user');
    const navigate =  useNavigate();

    const handleClick = async(event: React.FormEvent) =>{
        event?.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/register`,{
                username,
                email,
                password,
                role,
            });
            Cookies.set('authToken', response.data.authToken, {expires: 2});
            setError('');
            navigate('/');
        } catch (error) {
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

    return (
        <>
            <form className="h-screen flex justify-center items-center">
                <div>
                    <div>
                        <label>Username </label>
                        <input
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="rounded border-2 border-black m-2 p-1"
                            type="text" placeholder="example@email.com" />
                    </div>
                    <div>
                        <label>Email &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                        <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="rounded border-2 border-black m-2 p-1"
                            type="email" placeholder="example@email.com" />
                    </div>
                    
                    <div>
                        <label>Password &nbsp;</label>
                        <input
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="rounded border-2 border-black m-2 whitespace p-1"
                            type="password" placeholder="Enter password" />
                    </div>
                    <div>
                        <label>Role &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                        <input 
                            type="radio" 
                            name="role" 
                            value='user' 
                            defaultChecked={true}
                            onChange={() => setRole('user')}/>
                        <label className="pr-6 pl-2">User</label>
                        <input 
                            type="radio" 
                            name="role" 
                            value='admin'
                            onChange={()=> setRole('admin')}
                        />
                        <label className="pl-2">Admin</label>
                    </div>
                    <div className="flex justify-center items-center">
                        <button className="h-14 text-lg rounded-lg border-2 m-6 w-20 bg-indigo-500" style={{color:"white"}} type="submit" onClick={handleClick}>Signin</button>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </form>
        </>
    );
}