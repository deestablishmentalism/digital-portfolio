import {Outlet} from 'react-router-dom'
import Footer from '../Components/Footer';
import { Suspense, useEffect, useState } from 'react';
import SpinnerComponent from '../Components/SpinnerComponent';
export default function HomeLayout() {
    const [logoAnimation, setLogoAnimation] = useState(null);
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
            <div className="min-h-screen flex flex-col"> 
                <header className="p-4 w-full grid-bg flex justify-between text-emerald-400 sticky top-0 z-50 shadow">
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
                    <nav>
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
                                onClick={scrollToSection("contact")}
                            >Contact</button></li>
                        </ul>
                    </nav>
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