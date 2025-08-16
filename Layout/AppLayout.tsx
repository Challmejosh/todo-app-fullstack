"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

const client = new QueryClient()
const AppLayout = ({children}:{children:React.ReactNode}) => {
    return ( 
        <QueryClientProvider client={client}>
            <ToastContainer />
            {children}
        </QueryClientProvider>
     );
}
 
export default AppLayout;