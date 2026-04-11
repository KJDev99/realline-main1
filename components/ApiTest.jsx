"use client";

import { useEffect, useState } from "react";
import useApiStore from "@/store/useApiStore";

export default function ApiTest() {
    const { isLoading, data, error, getData, postData, putData, deleteData, clear } = useApiStore();
    const [result, setResult] = useState(null);

    useEffect(() => {
        async function init() {
            try {
                const response = await getData("/todos");
                setResult(response);
            } catch (err) {
                console.error("getData error", err);
            }
        }
        init();
    }, [getData]);

    const createTodo = async () => {
        try {
            const res = await postData("/todos", { title: "New Task", completed: false });
            setResult(res);
        } catch (err) {
            console.error("postData error", err);
        }
    };

    const updateTodo = async () => {
        try {
            const res = await putData("/todos/1", { title: "Updated Task", completed: true });
            setResult(res);
        } catch (err) {
            console.error("putData error", err);
        }
    };

    const removeTodo = async () => {
        try {
            const res = await deleteData("/todos/1");
            setResult(res);
        } catch (err) {
            console.error("deleteData error", err);
        }
    };

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Zustand + Axios API demo</h1>
            <div className="mb-4">
                <button onClick={createTodo} disabled={isLoading} className="mr-2 p-2 bg-blue-500 text-white rounded">
                    Create
                </button>
                <button onClick={updateTodo} disabled={isLoading} className="mr-2 p-2 bg-yellow-500 text-white rounded">
                    Update
                </button>
                <button onClick={removeTodo} disabled={isLoading} className="mr-2 p-2 bg-red-500 text-white rounded">
                    Delete
                </button>
                <button onClick={() => clear()} className="p-2 bg-gray-500 text-white rounded">
                    Clear
                </button>
            </div>

            <div className="mb-4">
                <strong>Status:</strong> {isLoading ? "Loading..." : "Idle"}
            </div>
            {error && (
                <div className="mb-4 text-red-600">
                    <strong>Error:</strong> {error.message || "Unknown"}
                </div>
            )}

            <pre className="bg-slate-100 p-4 rounded max-h-80 overflow-auto">{JSON.stringify({ data, result }, null, 2)}</pre>
        </main>
    );
}
