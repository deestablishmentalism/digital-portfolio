import { useState, useEffect } from "react";
import { SocialsIconMapper } from "../../utils/IconMapper";
import AddLinks from "../../Components/AddLink";
import SpinnerComponent from "../../Components/SpinnerComponent";
export default function Links() {
    const [isOpenModal, setIsOpenModal] = useState(false)
    const [links, setLinks] = useState([])
    const [isFetching, setIsFetching] = useState(true);
    useEffect(()=> { 
        async function fetchLinks() {
            try {
                const response = await fetch("/api/links");
                const data = await response.json();
                if(!response.ok) throw new Error("ERR " + response.status);
                setLinks(data);
            }
            catch(error) {
                console.error(error.message);
            }
            finally {
                setIsFetching(false);
            }
        }
        fetchLinks()
    },[]);
    return(
        <>
            <div>
                <div className="admin-header font-header-text text-[11px]">
                    <h1 className="text-3xl font-bold">Links</h1>    
                    <button className="admin-header-button"
                        onClick={()=> setIsOpenModal(true)}
                    >
                        <span className="font-bold">Add an active link</span>
                    </button>
                </div>
                <div>
                    {isOpenModal && (
                        <AddLinks open={isOpenModal} onOpenChange={setIsOpenModal}/>
                    )}
                </div>
                <div className="mt-2 p-2">
                    <h1 className="text-2xl font-bold text-white">My Current links</h1>
                    <div>
                        {isFetching ?
                            <div className="flex justify-center"> <SpinnerComponent width={30} height={30}></SpinnerComponent> </div>
                        : 
                        links.length === 0 ? 
                            <div className="flex justify-center"> <span className="text-white text-xl">No Links added yet.</span></div>
                            :
                            <div className="flex">
                                {links.map((link)=> {
                                    const created_at = new Date(link.createdAt);
                                    return(
                                            <div key={link._id} className="m-2 card-light font-bold hover:blur-[1px] cursor-pointer">
                                                <div className="flex">
                                                    <div className="p-2 flex items-center">
                                                        {(() => { 
                                                        const Icon = SocialsIconMapper(true)[link.social]; 
                                                        return Icon ? 
                                                        <Icon className="size-15"/> : null})()
                                                        }
                                                    </div>
                                                    <div className="p-2 flex flex-col items-center">
                                                        <span className="m-1 p-1 flex items-center">{link.link}</span>    
                                                        <span>
                                                        Created link entry at {
                                                            new Intl.DateTimeFormat("en-US",{
                                                                month: "long",
                                                                day: "numeric",
                                                                year: "numeric"
                                                            }).format(created_at)
                                                        }    
                                                        </span>   
                                                    </div>   
                                                </div>
                                                
                                            </div>
                                    );
                                })}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}
