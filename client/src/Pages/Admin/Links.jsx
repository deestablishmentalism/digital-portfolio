import { useState, useEffect } from "react";
import { SocialsIconMapper } from "../../utils/IconMapper";
import AddLinks from "../../Components/AddLink";
import SpinnerComponent from "../../Components/SpinnerComponent";
import { Trash, Pencil, X, Check } from "lucide-react";
import {Input}  from "@/components/ui/input";
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import axios from "axios";
import {useToastMessage} from "../../Components/ToastMessage"
import Footer from "../../Components/Footer"
import ContactSectionComponent from "../../Components/ContactSectionComponent"
import DeleteConfirmationModal from "../../Components/DeleteConfirmationModal";
import api from "../../api/axios";
export default function Links() {
    const showToastMessage = useToastMessage()
    const [isOpenModal, setIsOpenModal] = useState(false)
    const [isOpenEdit, setIsOpenEdit] = useState(false)
    const [editId, setEditId] = useState(null)
    const [deleteData, setDeleteData] = useState(null)
    const [links, setLinks] = useState([])
    const [isFetching, setIsFetching] = useState(true);
    const [contactRefreshKey, setContactRefreshKey] = useState(0)
    const [footerRefreshKey, setFooterRefreshKey] = useState(0)
    useEffect(()=> { 
        async function fetchLinks() {
            try {
                const response = await api.get("/links/admin");
                setLinks(response.data);
            }
            catch(error) {
                showToastMessage(false, error.message)
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
                        onClick={()=>setIsOpenModal(true)}
                    >
                        <span className="font-bold">Add an active link</span>
                    </button>
                </div>
                <div>
                    {isOpenModal && (
                        <AddLinks open={isOpenModal} onOpenChange={setIsOpenModal} 
                        onSave={(data)=> {
                            setLinks(prev=> [...prev, data])
                            setIsOpenModal(false)
                            setContactRefreshKey(prev=>prev+1)
                            setFooterRefreshKey(prev=>prev+1)
                        }}/>
                    )}
                    {deleteData && (
                        <DeleteConfirmationModal data={{
                            id: deleteData._id,
                            title: deleteData.social
                        }}
                            open={!!deleteData}
                            onOpenChange={(open) => {
                                if (!open) {
                                    setDeleteData(null)
                                }
                            }}
                            onDelete={(data)=> {
                                setLinks(prev=> 
                                    prev.filter(link=> link._id !== data._id)
                                )
                                setContactRefreshKey(prev=>prev+1)
                                setFooterRefreshKey(prev=>prev+1)
                                setDeleteData(null)
                            }}
                        />
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
                            <div className="flex flex-wrap">
                                {links.map((link)=> {
                                    const date = new Date(link.updatedAt ?? link.createdAt);
                                    const isEditing = editId === link._id;
                                        return (
                                            <div key={link._id} className="group m-2 card-light font-bold cursor-pointer relative w-150">
                                                <div 
                                                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 z-10
                                                    ${isEditing
                                                        ? "opacity-0 pointer-events-none"
                                                        : "opacity-0 group-hover:opacity-100 pointer-events-auto"
                                                    }
                                                `}>
                                                    <div className="p-2 rounded border-1 bg-emerald-600 hover:bg-emerald-900 text-white"
                                                        onClick={()=> setEditId(link._id)}
                                                    >
                                                        <Pencil strokeWidth={3}/>    
                                                    </div>
                                                    <div className="p-2 rounded border-1 bg-red-600 hover:bg-red-800 text-white"
                                                        onClick={()=> setDeleteData(link)}
                                                    >
                                                        <Trash strokeWidth={3} />    
                                                    </div>
                                                </div>
                                                <div className={`flex ${isEditing ? "": "group-hover:blur-[1px]"}`}>
                                                    <div className="p-2 flex items-center">
                                                        {(() => { 
                                                        const Icon = SocialsIconMapper(true)[link.social]; 
                                                        return Icon ? 
                                                        <Icon className="size-15"/> : null})()
                                                        }
                                                    </div>
                                                    {isEditing ?
                                                        <EditLink link={link} onClick={()=>setEditId(null)} 
                                                        onSave={(data)=> {
                                                            setLinks(prev =>
                                                                prev.map(link =>
                                                                    link._id === data._id ? data : link
                                                                )
                                                            )
                                                            setContactRefreshKey(prev=> prev+1)
                                                            setFooterRefreshKey(prev=> prev+1)
                                                            setEditId(null)
                                                        }}/>
                                                        :
                                                        (
                                                        <div className="p-2 flex flex-col items-center justify-center">
                                                            <span className="m-1 p-1 text-center">{returnPhoneNumber(link.social).toUpperCase()}</span>  
                                                            <span>
                                                            {link.updatedAt != null ? "Updated entry at " : "Created entry at "}
                                                            <span>
                                                            {
                                                                new Intl.DateTimeFormat("en-US",{
                                                                    month: "long",
                                                                    day: "numeric",
                                                                    year: "numeric"
                                                                }).format(date)
                                                            }    
                                                            </span>    
                                                            </span>   
                                                        </div>      
                                                        )
                                                    }  
                                                </div>
                                            </div>
                                    );
                                })}
                            </div>
                        }
                    </div>
                </div>
                <div className="mt-2">
                    <h1 className="text-2xl font-bold text-white">Footer Links</h1>
                    <Footer preview={true} refreshKey={footerRefreshKey}/>
                </div>
                <div className="mt-2">
                    <h1 className="text-2xl font-bold text-white">Contact Links</h1>
                    <ContactSectionComponent preview={true} refreshKey={contactRefreshKey}/>
                </div>
            </div>
        </>
    );
}
function returnPhoneNumber(text) {
    return typeof text === "string"
    ? text.replace(/phonenumber/g, "phone number") :
    value
}
function EditLink({link, onClick, onSave}) {
    const showToastMessage = useToastMessage()
    const [payLoad, setPayLoad] = useState(link)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        try {
            setIsSaving(true)
            const response = await api.put("/links", payLoad, {
                headers: {
                    "Content-Type" : "application/json"
                }
            });
            showToastMessage(response.data.success, response.data.message);
            onSave(response.data.data)
        }
        catch(error) {
            showToastMessage(false, error.message);
        }
        finally {
            setIsSaving(false)
        }
    }
    return(
        <>
            <div className="flex flex-col w-full">
                <div className="w-full flex">
                    <div>
                        <Label>Edit Link</Label>
                        <Input type="text" value={payLoad.link} 
                        onChange={(e)=> setPayLoad({...payLoad, link: e.target.value})} 
                        className="bg-white rounded w-100"/>        
                    </div>
                    <div className="ml-2 flex flex-col">
                        <div className="flex">
                            <Checkbox className="m-1" checked={payLoad.in_footer} 
                            onCheckedChange={(checked)=>setPayLoad({...payLoad, in_footer: checked})}/>
                            <Label className="m-1">Footer</Label>
                        </div>
                        <div className="flex">
                            <Checkbox className="m-1" checked={payLoad.in_contact} 
                            onCheckedChange={(checked)=> setPayLoad({...payLoad, in_contact: checked})}/>
                            <Label className="m-1">Contacts</Label>    
                        </div>
                    </div>
                </div>
                <div className="flex justify-center">
                    <Button
                        onClick={onClick}
                        className="cursor-pointer p-2 m-1 bg-white text-black"
                    > <X/></Button>
                    <Button type="submit" className="m-1 p-2 cursor-pointer"
                        onClick={handleSave}
                    >
                        {isSaving ? <SpinnerComponent/> : <Check/>}
                    </Button>
                </div>
            </div>
        </>
    );
}
