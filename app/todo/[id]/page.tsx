interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

'use client'
import { useState, useEffect } from 'react';
import { useParams } from "next/navigation";
import { useQuery } from '@tanstack/react-query';

const Page = () => {
    const { id } = useParams();
    const url = process.env.NEXT_PUBLIC_BACKEND_API ?? "http://localhost:3000"
    const [todo, setTodo] = useState<Todo | null>(null);
    const fetchTodo = async () => {
        const res = await fetch(`${url}/todos/${id}`);
        if (!res.ok) throw new Error('failed to fetch');
        const data = await res.json();
        return data
    };
    const { data,error,isLoading } = useQuery({
        queryKey: ['todo', id],
        queryFn: fetchTodo,
        enabled: !!id,
        staleTime: 5000,
    })
    useEffect(() => {
        if(data){
            setTodo(data)
        }
    }, [data,id]);
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
                <div className="text-center py-12">
                    <div className="text-6xl mb-4 animate-pulse">⚠️</div>
                    <p className="text-red-300 text-lg font-bold mb-2">Something went wrong!</p>
                    <p className="text-purple-200 text-sm mb-4">Unable to fetch todo. Please check your connection or try again.</p>
                    <button
                        onClick={fetchTodo}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
                <div className="space-y-3 w-full max-w-md">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 animate-pulse flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-400/40 mb-4" />
                        <div className="h-6 w-2/3 bg-purple-300/30 rounded mb-2" />
                        <div className="h-4 w-1/2 bg-purple-300/20 rounded" />
                    </div>
                </div>
            </div>
        );
    }
    if (!todo) return null;
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
                <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Todo Details</h2>
                    <p className="text-purple-200 text-md">See your task in detail</p>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${todo.completed ? 'bg-green-500 border-green-500' : 'border-white/40'}`}>
                            {todo.completed ? <span className="text-white">✔️</span> : null}
                        </span>
                        <span className={`flex-1 text-lg ${todo.completed ? 'text-purple-300 line-through' : 'text-white'}`}>{todo.text}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${todo.completed ? 'bg-green-500 text-white' : 'bg-orange-400 text-white'}`}>{todo.completed ? 'Completed' : 'Pending'}</span>
                        <span className="px-3 py-1 rounded-full text-xs bg-purple-400/30 text-purple-100">ID: {todo.id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
 
export default Page;