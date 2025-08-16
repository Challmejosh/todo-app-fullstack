"use client"
import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
// import { Plus, Check, X, Edit2, Trash2 } from 'lucide-react';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoApp() {
  const url = process.env.NEXT_PUBLIC_BACKEND ?? "http://localhost:3000"
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [patchingId, setPatchingId] = useState<number | null>(null);
  const fetchTodos = async ()=>{
    const allTodos = await fetch(`${url}/todos`)
    if(!allTodos.ok){
      throw new Error("failed to fetch")
    }
    const data = await allTodos.json()
    return data
  }
  const { data,isLoading,error,refetch } = useQuery({
    queryKey:["todos"],
    queryFn:fetchTodos,
    staleTime: 5000,
  })
  useEffect(()=>{
    if(data){
      setTodos(data)
    }
  },[data])
  const addFetch = async (newTodo: { text: string; completed: boolean })=>{
     const res = await fetch(String(url+"/todos"),{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(newTodo)
      })
      if(!res.ok) throw new Error("failed to add todo")
      const data = await res.json()
      return data
  }
  const { mutate:addMutate,isPending:isAdding } = useMutation({
    mutationFn:async (todo:{ text: string; completed: boolean })=>addFetch(todo),
    onSuccess:()=>{
      refetch()
      setInputValue('');
      toast.success("todo added successfully")
    },
    onError:(error)=>{
      console.log(error.message)
      toast.error(error.message)
      setInputValue('');
    }
  })
  const addTodo = async () => {
    if (inputValue.trim() !== '') {
      const newTodo: { text: string; completed: boolean } = {
        text: inputValue.trim(),
        completed: false
      };
      await addMutate(newTodo)
    }
  };
  const patchFetch = async (todo:Todo)=>{
    const res = await fetch(`${url}/todos/${todo.id}?id=${todo.id}`,{
      method: "PATCH",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({completed:todo.completed,text:todo.text})
    })
    if(!res.ok) throw new Error("failed to update todo")
    const data = await res.json()
    return data
  }
  const { mutate:patchMutate,isPending:isPatching  } = useMutation({
    mutationFn:async (todo:Todo)=>patchFetch(todo),
    onMutate:(todo:Todo) => {
      setPatchingId(todo.id);
    },
    onSettled:() => {
      setPatchingId(null);
      setEditingId(null);
      setEditingText('');
    },
    onSuccess:(data)=>{
      refetch()
      toast.success("todo updated successfully")
    },
    onError:(error)=>{
      console.log(error.message)
      toast.error(error.message)
    }
  })
  const patchTodo = async (todo:Todo)=>{
    await patchMutate(todo)
  }
  const toggleComplete = async (todo: Todo) => {
    const updatedTodo: Todo = { ...todo, completed: !todo.completed };

    await patchTodo(updatedTodo)
  };
  const deleteFetch = async (id: number)=>{
     const delTodo = await fetch(`${url}/todos/${id}?id=${id}`,{
      method:"DELETE",
    })
    if(!delTodo.ok) throw new Error("failed to delete todo")
    const data = await delTodo.json()
    return data
  }
  const { mutate:deleteMutate,isPending:isDeleting } = useMutation({
    mutationFn:async (id:number)=>deleteFetch(id),
    onMutate:(id:number) => {
      setDeletingId(id);
    },
    onSettled:() => {
      setDeletingId(null);
    },
    onSuccess:()=>{
      refetch()
      toast.success("todo deleted successfully")
    },
    onError:(error)=>{
      console.log(error.message)
      toast.error(error.message)
    }
  })
  const deleteTodo = async (id: number)=> {
    await deleteMutate(id)
  };


  const startEdit = (id: number, text: string): void => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = async (id: number,text: string) => {
    const find =  todos?.find(todo=>todo.id===id)
    if (editingText.trim() !== ''&&find) {
      find.text = editingText.trim()
      await patchTodo(find)
    }
  };

  const cancelEdit = (): void => {
    setEditingId(null);
    setEditingText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, id: number): void => {
    if (e.key === 'Enter') {
      saveEdit(id,editingText);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const completedCount: number = todos?.filter(todo => todo.completed).length;
  if(error){
    return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4 animate-pulse">⚠️</div>
      <p className="text-red-300 text-lg font-bold mb-2">Something went wrong!</p>
      <p className="text-purple-200 text-sm mb-4">Unable to fetch todos. Please check your connection or try again.</p>
      <button
        onClick={() => refetch()}
        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        Retry
      </button>
    </div>
  )
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold capitalize text-white mb-2 tracking-tight">
           todos
          </h1>
          <p className="text-purple-200 text-lg">
            get things done, no cap
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
          <div className="flex justify-between text-center">
            <div>
              <div className="text-2xl font-bold text-white">{todos.length}</div>
              <div className="text-purple-200 text-sm">total tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{completedCount}</div>
              <div className="text-purple-200 text-sm">completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{todos.length - completedCount}</div>
              <div className="text-purple-200 text-sm">remaining</div>
            </div>
          </div>
        </div>

        {/* Add Todo Input */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="what needs to be done? 💭"
              className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
              disabled={isAdding}
            />
            <button
              onClick={addTodo}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
              disabled={isAdding}
            >
              <Plus size={20} /> 
            </button>
          </div>
          {isAdding && (
            <div className="flex items-center gap-2 mt-4 animate-pulse">
              <div className="h-4 w-4 rounded-full bg-purple-400 opacity-60" />
              <span className="text-purple-300 text-sm">Adding todo...</span>
            </div>
          )}
        </div>

        

        {/* Todo List */}
        {!error && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 animate-pulse flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-400/40" />
                    <div className="flex-1 h-4 bg-purple-300/30 rounded" />
                    <div className="flex gap-1">
                      <div className="w-6 h-6 bg-blue-300/30 rounded-lg" />
                      <div className="w-6 h-6 bg-red-300/30 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-purple-200 text-lg">no todos yet!</p>
                <p className="text-purple-300 text-sm">add one above to get started</p>
              </div>
            ) : (
              todos.map((todo: Todo) => (
                <div
                  key={todo.id}
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transition-all duration-300 ${
                    todo.completed ? 'opacity-60 scale-95' : 'hover:bg-white/20'
                  }`}
                >
                  {editingId === todo.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingText(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleEditKeyPress(e, todo.id)}
                        className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(todo.id,editingText)}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-all duration-200"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition-all duration-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleComplete(todo)}
                        className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all duration-200 flex items-center justify-center ${
                          todo.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-white/40 hover:border-purple-400'
                        }`}
                        disabled={isPatching}
                      >
                        {todo.completed && <Check size={14} className="text-white" />}
                      </button>
                      <span
                        className={`flex-1 transition-all duration-200 ${
                          todo.completed
                            ? 'text-purple-300 line-through'
                            : 'text-white'
                        }`}
                      >
                        {todo.text}
                        {isPatching && patchingId === todo.id && (
                          <span className="ml-2 text-xs text-purple-300 animate-pulse">Updating...</span>
                        )}
                        {isDeleting && deletingId === todo.id && (
                          <span className="ml-2 text-xs text-red-300 animate-pulse">Deleting...</span>
                        )}
                      </span>
                      <div className="flex gap-1 opacity-60 hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => startEdit(todo.id, todo.text)}
                          className="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200"
                          disabled={isPatching}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200"
                          disabled={isDeleting}
                        >
                          <Trash2 size={14} />
                        </button>
                        <Link
                          href={`/todo/${todo.id}`}
                          className="text-purple-400 hover:text-purple-300 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-xs font-semibold border border-purple-400/40"
                          style={{ minWidth: 48, textAlign: 'center' }}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
  )}

      </div>
    </div>
  );
}