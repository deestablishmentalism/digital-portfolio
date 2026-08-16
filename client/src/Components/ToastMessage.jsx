import { toast } from "@/components/ui/toast";
export function useToastMessage() {
    function showToast(isSuccess, message) {
        toast.add({
            title: isSuccess ? "Success!" : "Error!",
            description: message,
            type: isSuccess ? "success" : "error"
        });
    }
    return showToast;
}