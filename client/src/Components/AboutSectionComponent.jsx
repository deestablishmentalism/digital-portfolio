import { useEffect, useState } from "react"
export default function AboutSectionComponent({preview=false}) {
    const [personalInfo, setPersonalInfo] = useState(null)
    useEffect(() => {
        async function fetchPersonalInfo() {
            try {
                const response = await fetch("/api/personal-info");
                const data = await response.json();

                setPersonalInfo(data.data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchPersonalInfo();
    }, []);
    return(
        <>
            <div>
                <div className="p-2 flex gap-2 flex-wrap md:flex-nowrap">
                    <div className="flex flex-col w-full mr-2 md:w-50">
                        {personalInfo?.profile  && (
                            <div className="rounded overflow-hidden w-full h-70 md:w-50 md-h-60">
                            {
                                <img src={personalInfo?.profile?.secure_url} alt="profile"/>
                            }
                            </div>
                        )}    
                        <div className="mt-2 px-1 rounded-full text-center border-2 border-slate-500 bg-radial from-teal-600/70 via-teal-800/70 to-teal-900/70">
                            {personalInfo?.first_name && personalInfo?.middle_name && personalInfo?.last_name && (
                                <span className="text-teal-200 text-[11px] font-header-text">{personalInfo?.last_name}, {personalInfo?.first_name} {personalInfo?.middle_name}</span>
                            ) 
                            }
                        </div>
                    </div> 
                    <div className="ml-2 w-full admin-container">
                        {personalInfo?.address && (
                            <div>
                                <h1 className="font-sub-header-text text-white mb-2">Address</h1>
                                <div className="px-2 py-1 w-fit text-[11px] text-center rounded-full border-2 border-slate-500 bg-gradient-to-r from-teal-900/70 via-teal-600/70 to-teal-950/70">
                                    <span className="text-white font-bold text-[11px] ">
                                        {personalInfo?.address.region}, {personalInfo?.address.house_number} {personalInfo?.address.subdivision}, {personalInfo?.address.barangay},
                                        {personalInfo?.address.city}, {personalInfo?.address.province}
                                    </span>
                                </div>
                            </div>                                
                        )}
                        <div>
                            <h1 className="font-sub-header-text text-white mb-2">Summary</h1>
                            {personalInfo?.summary && (
                                <p className="text-[13px] text-white font-bold">
                                    {personalInfo?.summary}
                                </p>
                            )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}