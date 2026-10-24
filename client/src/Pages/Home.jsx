import { useOutletContext } from "react-router-dom";
import ProjectsSectionComponent from "../Components/ProjectsSectionComponent";
import SkillsSectionComponent from "../Components/SkillsSectionComponent";
import AboutSectionComponent from "../Components/AboutSectionComponent";
import ContactSectionComponent from "../Components/ContactSectionComponent";
import AIChatbot from "../Components/AIChatbot";

function Home() {
    const { handleSectionLoad } = useOutletContext();

    return (
        <>
            <div className="font-body-text space-y-6 p-2 sm:p-4 max-w-7xl mx-auto w-full">
                <div id="about" className="home-container">
                    <h1 className="m-2 text-2xl font-sub-header-text text-white">About</h1>
                    <AboutSectionComponent preview={false} onLoad={handleSectionLoad} />
                </div>
                <div id="skills" className="home-container">
                    <h1 className="m-2 text-2xl font-sub-header-text text-white">Skills</h1>
                    <SkillsSectionComponent preview={false} onLoad={handleSectionLoad} />
                </div>
                <div id="projects" className="home-container">
                    <h1 className="m-2 text-2xl font-sub-header-text text-white">Projects</h1>
                    <ProjectsSectionComponent preview={false} onLoad={handleSectionLoad} />
                </div>
                <div id="contacts" className="home-container">
                    <h1 className="m-2 text-2xl font-sub-header-text text-white">Contact</h1>
                    <ContactSectionComponent preview={false} onLoad={handleSectionLoad} />
                </div>
            </div>
            <AIChatbot />
        </>
    );
}

export default Home;
