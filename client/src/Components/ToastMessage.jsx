import { toast } from "sonner";
export default function ToastMessage(isSuccess, message) {
    if (isSuccess) {
        toast.success(message);
    }
    else {
        toast.error(message);
    }
}