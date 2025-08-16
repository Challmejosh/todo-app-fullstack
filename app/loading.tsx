"use client"
import { Loader } from "lucide-react";

const Loading = () => {
    return ( 
        <div className="h-dvh flex items-center justify-center ">
            <Loader className="animate-spin text-black " />
        </div>
     );
}
 
export default Loading;