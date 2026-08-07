import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState, Fragment } from "react";
import { SocialsIconMapper } from "../utils/IconMapper";
import SpinnerComponent from "./SpinnerComponent"
import axios from "axios"
export default function AddLinks({open, onOpenChange}) {
    const [socials, setSocials] = useState([]);
    const [selectedSocial, setSelectedSocial] = useState("");
    const [link, setLink] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(()=> {
        async function fetchSocials() {
            try {
                const response = await fetch("/api/socials");
                const data = await response.json();
                if(!response.ok) throw new Error("ERR " + response.status);
                setSocials(Object.values(data) || []);
            }
            catch(error) {
                console.error("Failed to fetch socials: " + error.message);
            }
        }
        fetchSocials();
    },[])
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const body = {
                social: selectedSocial,
                link: link
            };
            const response = await axios.post("/api/links", body);
            if(!response.status === 201) throw new Error("ERR: " + response.status);
            else window.location.reload();
        }
        catch(error) {
            console.error(error.message);
        }
        finally {
            setIsSubmitting(false);
        }
    }
    return(
        <>
            <div>
                <Dialog disablePointerDismissal open={open} onOpenChange={onOpenChange}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle> Add an active link</DialogTitle>
                            <DialogDescription className="font-black text-center text-2xl">Link details</DialogDescription>
                            <DialogClose />
                        </DialogHeader>
                        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                            <div>
                                <Label className="m-1">Select Social</Label>
                                <BuildSelectComponent items={socials} setSelectedSocial={setSelectedSocial}/>
                            </div>
                            <div>
                                <Label className="m-1">Link</Label>
                                <Input placeholder="Enter social's URL or corresponding value" value={link} 
                                    onChange={(e)=> setLink(e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 
                                    <SpinnerComponent width={25} height={25} color="black"></SpinnerComponent>
                                    : "Add Link"
                                }
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
function BuildSelectComponent({items, setSelectedSocial }) {
    const itemMap = Object.fromEntries(items.map(i => [i.slug, i]));
    return(
        <>
            <Select onValueChange={setSelectedSocial}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select available socials">
                    {(v) => v ? itemMap[v]?.name || v : "Select available socials"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Socials</SelectLabel>
                    {items.map((item)=> (
                        <Fragment key={item.slug}>
                            <SelectItem value={item.slug}>
                                {(() => {
                                    const Icon = SocialsIconMapper(false)[item.slug];
                                    return Icon ? <Icon className="size-4 shrink-0 inline" /> : null;
                                })()}
                                {item.name}
                            </SelectItem>
                        </Fragment>
                    ))
                    }
                  </SelectGroup>
                </SelectContent>
            </Select>
        </>
    );
}