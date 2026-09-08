import { useOutletContext } from "react-router-dom";
import ProjectsSectionComponent from "../Components/ProjectsSectionComponent";
import SkillsSectionComponent from "../Components/SkillsSectionComponent";
import AboutSectionComponent from "../Components/AboutSectionComponent";
import ContactSectionComponent from "../Components/ContactSectionComponent";
import AIChatbot from "../Components/AIChatbot";

function Home() {
    const { handleSectionLoad } = useOutletContext();

    return(
        <>
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