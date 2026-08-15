import ProjectsSectionComponent from "../Components/ProjectsSectionComponent";
import SkillsSectionComponent from "../Components/SkillsSectionComponent";
import AboutSectionComponent from "../Components/AboutSectionComponent";
import ContactSectionComponent from "../Components/ContactSectionComponent";
function Home() {
    return(
        <>
            <div className="font-body-text">
                <div id="about" className="home-container">
                    <h1 className="m-2 text-2xl font-sub-header-text text-white">About</h1>
                    <AboutSectionComponent preview={false}/>
                </div>
                <div id="skills" className="home-container">
                    <h1 className="m-2 text-2xl font-sub-header-text text-white"> Skills</h1>
                    <SkillsSectionComponent preview={false}/>
                </div>
                <div id="projects" className="home-container">
                    <h1 className="m-2 text-2xl font-sub-header-text text-white"> Projects</h1>
                    <div className="flex flex-wrap w-full overflow-y-auto scrollable">
                        <ProjectsSectionComponent/>   
                    </div>
                </div>
                <div id="contacts" className="home-container">
                    <h1 className="m-2 text-2xl font-sub-header-text text-white"> Contacts</h1>
                    <div className="p-2 w-full">
                        <ContactSectionComponent/>
                    </div>
                </div>
            </div>
        </>
    );
}
export default Home;