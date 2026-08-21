import {
    Dialog, 
    DialogContent,
    DialogClose,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import { useState } from "react";
import { useToastMessage } from "./ToastMessage";
import SpinnerComponent from "./SpinnerComponent";
import axios from "axios";
export default function DeleteConfirmationModal({open, onOpenChange, data, onDelete}) {
    const showToastMessage = useToastMessage();
    const [isDeleting, setIsDeleting] = useState(false)
    const handleDelete = async ()=> {
        try {
            setIsDeleting(true)
            const payLoad = {
                id: data.id
            }
            const response = await axios.delete("/api/links",{
                data: payLoad
            });
            if(!response.status === 200) throw new Error("ERR: " + response.status)
            showToastMessage(response.data.success, response.data.message);
            onDelete(response.data.data)
        }
        catch(error) {
            showToastMessage(false, error.message)
        }
        finally {
            setIsDeleting(false)
        }
    }
    return(
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogClose/>
                    <div className="text-center">
                     <p>Are you sure you want to delete <span className="font-bold">{data.title.toUpperCase()}</span>?</p>    
                    </div>
                    <Button type="submit"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >{isDeleting ?
                        <SpinnerComponent width={20} height={20}/>
                        :
                        "Delete"
                    }
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}