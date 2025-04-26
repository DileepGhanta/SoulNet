import { AxiosError} from "axios";
import { toast } from "sonner";

interface ApiErrorResponse{
    message:string;

}

//The main purpose of this code is to handle API requests with error handling, showing loading states, and 
// displaying error messages using toast. It wraps an API call, sets the loading state, and catches any errors, 
// showing appropriate messages. If the request succeeds, it returns the response; otherwise, it returns null.

export const handleAuthRequest = async <T> (
    requestCallback: ()=>Promise<T> ,
     setLoading?:(loading: boolean)=>void
     ):Promise<T | null> =>{
    if(setLoading) setLoading(true);

    try{
        const response = await requestCallback();
        return response;

    }catch(error){
        const axiosError = error as AxiosError<ApiErrorResponse>
        console.log(error);
        if(axiosError?.response?.data?.message){
            console.log(axiosError?.response?.data?.message);
            toast.error(axiosError?.response?.data?.message)
        }else{
            toast.error("An unexpected error occured");
        }
        return null;

    }finally{
        if(setLoading) setLoading(false);
    }
}