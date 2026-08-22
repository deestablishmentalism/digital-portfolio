import {useState} from 'react'
import { useNavigate, NavLink } from 'react-router-dom';
import {Eye, EyeClosed, ArrowBigLeft} from 'lucide-react'
import api from '../api/axios';
import { Suspense } from 'react';
import SpinnerComponent from '../Components/SpinnerComponent';
import {Button} from "@/components/ui/button"
import { useToastMessage } from '../Components/ToastMessage';
export default function Login() {
    const showToastMessage = useToastMessage()
    const navigate = useNavigate();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [payLoad, setPayload] = useState({
        username: "",
        password: ""
    });
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const response = await api.post("/users/logging-in", payLoad,{
                headers: {
                    "Content-Type" : "application/json"
                }
            });
            showToastMessage(response.data.success, response.data.message)
            if(response.data.success) {
                navigate("/admin");
            }
        }
        catch(error) {
            showToastMessage(false,error.message)
        }
        finally {
            setIsLoggingIn(false);
        }
    }; 
    return(
        <>
            <Suspense fallback={<SpinnerComponent width={40} height={50} color="black"/>}>
                <div className="flex items-center justify-center w-full min-h-screen">
                    <div className="p-4 items-center flex flex-col bg-gradient-to-br from-teal-800 via-teal-900 to-teal-950 rounded shadow-lg">
                        <NavLink to="/" className="flex font-sub-header-text text-[11px]"> 
                            <div className="p-2 rounded flex content-start bg-gradient-to-r from-teal-800 via-teal-900 to-teal-950 text-teal-300 cursor-pointer">
                                <ArrowBigLeft></ArrowBigLeft>
                                <span>Back To Portfolio</span>
                            </div>
                        </NavLink>
                        <h1 className="m-2 text-2xl font-bold font-header-text text-black text-center"> Login</h1>
                        <form onSubmit={handleLogin}>
                            <input type="text" 
                                value={payLoad.username}
                                onChange={(e)=> setPayload({...payLoad, username: e.target.value})}
                                placeholder="Enter your username"
                                className="m-2 p-2 bg-white rounded"
                            />
                            <div className="relative">
                                <input 
                                    value={payLoad.password}
                                    type={showPassword ? "text" : "password"} 
                                    onChange={(e)=> setPayload({...payLoad,password: e.target.value })}
                                    placeholder="Enter your password"
                                    className="m-2 p-2 bg-white rounded"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-center">
                                <Button type="submit" 
                                    className="m-2 p-4 bg-black rounded text-center"
                                    disabled={isLoggingIn}>
                                    {isLoggingIn ? <SpinnerComponent width={25} height={25}/> : <span className="font-header-text">Login</span>}
                                </Button>    
                            </div>
                            
                        </form>
                    </div>
                </div>    
            </Suspense>
            
        </>
    );
}