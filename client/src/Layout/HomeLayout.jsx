import {Outlet} from 'react-router-dom'
import Footer from '../Components/Footer';
import { Suspense, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import SpinnerComponent from '../Components/SpinnerComponent';
export default function HomeLayout() {
    const [logoAnimation, setLogoAnimation] = useState(null);
    const [isBurger, setIsBurger] = useState(false);
    const scrollToSection = (id)=> {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            "block": "center"
        })
    }
    useEffect(() => {
        import("../assets/logo-animation-12fps.webm")
        .then((module) => setLogoAnimation(module.default))
        .catch(() => setLogoAnimation(null));
    }, []);
    return(
        <>
            <div className="min-h-screen flex flex-col relative"> 
                    <header className="p-4 w-full grid-bg text-emerald-400 relative sticky top-0 z-50 shadow">
                        <div className="w-full flex justify-between items-center">
                            <div className="flex items-center">
                                <a href='/' className='cursor-pointer'>
                                    {logoAnimation ? (
                                        <video
                                        src={logoAnimation}
                                        autoPlay
                                        muted
                                        playsInline
                                        onError={() => setLogoAnimation(null)}
                                        />
                                ) : (
                                    <span className="font-header-text">David</span>
                                )}   
                                </a>
                            </div>                        
                            <nav className="hidden md:block">
                                <ul className="flex space-x-6 [&>li]:p-2 [&>li]:font-header-text">
                                    <li><button className="cursor-pointer hover:text-blue-500 bracket-hover"
                                        onClick={()=>scrollToSection("about")}
                                    >About</button></li>
                                    <li><button className="cursor-pointer hover:text-blue-500 bracket-hover"
                                        onClick={()=>scrollToSection("skills")}
                                    >Skills</button></li>
                                    <li><button className="cursor-pointer hover:text-blue-500 bracket-hover"
                                        onClick={()=>scrollToSection("projects")}
                                    >Projects</button></li>
                                    <li><button className="cursor-pointer hover:text-blue-500 bracket-hover"
                                        onClick={()=>scrollToSection("contacts")}
                                    >Contact</button></li>
                                </ul>
                            </nav>
                            <button className="md:hidden cursor-pointer"
                                onClick={()=> setIsBurger(prev=>!prev)}
                            >
                                {!isBurger ? 
                                    <Menu width={40}height={50}/>
                                :
                                    <X width={40}height={50}/>
                                }
                                
                            </button>
                        </div>
                        {/* Mobile navigation */}
                        {isBurger && (
                            <nav className="absolute top-full left-0 md:hidden w-full text-emerald-400 bg-slate-950/70 backdrop-blur-md">
                                <ul className="w-full flex flex-col items-center">
                                    <li className="w-full">
                                        <button
                                            className="w-full h-full p-4 cursor-pointer border-b-1 hover:bg-slate-800"
                                            onClick={() => {
                                                scrollToSection("about");
                                                setIsBurger(false);
                                            }}
                                        >
                                            About
                                        </button>
                                    </li>
                                    <li className="w-full">
                                        <button
                                            className="w-full h-full p-4 cursor-pointer border-b-1 hover:bg-slate-800"
                                            onClick={() => {
                                                scrollToSection("skills");
                                                setIsBurger(false);
                                            }}
                                        >
                                            Skills
                                        </button>
                                    </li>
                                    <li className="w-full">
                                        <button
                                            className="w-full h-full p-4 cursor-pointer border-b-1 hover:bg-slate-800"
                                            onClick={() => {
                                                scrollToSection("projects");
                                                setIsBurger(false);
                                            }}
                                        >
                                            Projects
                                        </button>
                                    </li>
                                    <li className="w-full">
                                        <button
                                            className="w-full h-full p-4 cursor-pointer hover:bg-slate-800 border-b-1"
                                            onClick={() => {
                                                scrollToSection("contacts");
                                                setIsBurger(false);
                                            }}
                                        >
                                            Contact
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </header>  
                <main className="flex-1">
                   <Suspense fallback={<SpinnerComponent width={40} height={40} color="black"/>}>
                        <Outlet/>
                    </Suspense>
                </main>
                <Footer/>
            </div>
        </>
    );
}