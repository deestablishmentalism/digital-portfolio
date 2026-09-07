import { useState, useCallback, useRef } from "react";
import ProjectsSectionComponent from "../Components/ProjectsSectionComponent";
import SkillsSectionComponent from "../Components/SkillsSectionComponent";
import AboutSectionComponent from "../Components/AboutSectionComponent";
import ContactSectionComponent from "../Components/ContactSectionComponent";
import AIChatbot from "../Components/AIChatbot";
import SpinnerComponent from "../Components/SpinnerComponent";

const TOTAL_SECTIONS = 4;

function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const loadedCount = useRef(0);

    const handleSectionLoad = useCallback(() => {
        loadedCount.current += 1;
        if (loadedCount.current >= TOTAL_SECTIONS) {
            setIsLoading(false);
        }
    }, []);

    return(
        <>
            {isLoading && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center
                    bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 transition-opacity duration-500">
                    <SpinnerComponent width={100} height={100} />
                    <span className="mt-4 text-sm text-slate-400 font-body-text animate-pulse">
                        Loading portfolio...
                    </span>
                </div>
            )}
            <div className="font-body-text">
                <div id="about" className="home-container">
                    <h1 className="m-2 text-2xl font-sub-header-text text-white">About</h1>
                    <AboutSectionComponent preview={false} onLoad={handleSectionLoad}/>
                </div>
                <div id="skills" className="home-container">
                    <h1 className="m-2 text-2xl font-sub-header-text text-white"> Skills</h1>
                    <SkillsSectionComponent preview={false} onLoad={handleSectionLoad}/>
                </div>
                <div id="projects" className="home-container">
                    <h1 className="m-2 text-2xl font-sub-header-text text-white"> Projects</h1>
                    <div className="flex flex-wrap w-full overflow-y-auto scrollable">
                        <ProjectsSectionComponent preview={false} onLoad={handleSectionLoad}/>   
                    </div>
                </div>
                <div id="contacts" className="home-container">
                    <h1 className="m-2 text-2xl font-sub-header-text text-white"> Contacts</h1>
                    <div className="p-2 w-full">
                        <ContactSectionComponent preview={false} onLoad={handleSectionLoad}/>
                    </div>
                </div>
            </div>
            <AIChatbot />
        </>
    );
}
export default Home;