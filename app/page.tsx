import {ConvAI} from "@/components/ConvAI";

export default function Home() {
    return (
        <div
            className="w-full items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <div className="w-[41vw] flex flex-col gap-8 row-start-2 items-center bg-gray-300 p-8 rounded-xl">
                <h1 className="text-4xl font-bold">Memoria AI</h1>
                <h3 className="w-full text-gray-600 text-xl text-center">
                    Bring back your predecessors to life with our amazing AI virtual persona clones!
                </h3>
                <input 
                    type="text" 
                    placeholder="Enter clone title"
                    className="w-full p-2 border rounded-md"
                />
                <textarea 
                    placeholder="Enter detailed description"
                    className="w-full h-48 p-2 border rounded-md resize-y overflow-auto"
                />
                <input
                    type="file"
                    accept=".mp3"
                    className="w-full p-2 border rounded-md"
                />
                <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                    Create virtual clone
                </button>
            </div>
        </div>
    );
}
