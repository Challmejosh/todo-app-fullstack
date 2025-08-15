"use client"
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
// import { Plus, Check, X, Edit2, Trash2 } from 'lucide-react';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoApp() {
  const url = process.env.NEXT_PUBLIC_BACKEND
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const fetchTodos = async ()=>{
    const allTodos = await fetch(`${url}/todos`)
    const data = await allTodos.json()
    setTodos(data)
  }
  useEffect(()=>{
    fetchTodos()
  },[])
  const addTodo = async () => {
    if (inputValue.trim() !== '') {
      const newTodo: { text: string; completed: boolean } = {
        // id: Date.now(),
        text: inputValue.trim(),
        completed: false
      };
      const res = await fetch(String(url),{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(newTodo)
      })
      const data = await res.json()
      if(data){
        fetchTodos()
      }
      // setTodos([newTodo, ...todos]);
      setInputValue('');
    }
  };
  const patchTodo = async (todo:Todo)=>{
    const res = await fetch(`${url}/${todo.id}`,{
      method: "PATCH",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({completed:todo.completed,text:todo.text})
    })
    const data = await res.json()
    if(data){
      fetchTodos()
    }
  }
  const toggleComplete = (todo: Todo): void => {
    const updatedTodo: Todo = { ...todo, completed: !todo.completed };
    
    patchTodo(updatedTodo)
  };

  const deleteTodo = async (id: number)=> {
    // const deleteTOD = await fetch("${url}",{
    //   method:"DELETE",
    //   headers:{
    //     "Content-Type":"application/json"
    //   },
    //   body:JSON.stringify({id})
    // })
    const delTodo = await fetch(`${url}/${id}`,{
      method:"DELETE",
    })

    const data = await delTodo.json()
    if(data){
      fetchTodos()
    }
    // setTodos(todos.filter(todo => todo.id !== id));
    };

  const editTodo = (id: number, text: string): void => {
    
  };

  const startEdit = (id: number, text: string): void => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = (id: number): void => {
    const find =  todos?.find(todo=>todo.id===id?{...todo,text:editingText.trim()}:todo)
    if (editingText.trim() !== ''&&find) {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, text: editingText.trim() } : todo
      ));
      patchTodo(find)
    }
    setEditingId(null);
    setEditingText('');
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
      saveEdit(id);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const completedCount: number = todos?.filter(todo => todo.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
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
            />
            <button
              onClick={addTodo}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <Plus size={20} /> 
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
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
                      onClick={() => saveEdit(todo.id)}
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
                    </span>
                    
                    <div className="flex gap-1 opacity-60 hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => startEdit(todo.id, todo.text)}
                        className="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-purple-300 text-sm">
          made with ✨ for productivity kings & queens
        </div>
      </div>
    </div>
  );
}