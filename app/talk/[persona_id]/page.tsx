import {ConvAI} from "@/components/ConvAI";
import { getPersona } from "@/lib/database";

export default async function Home({ params }: { params: { persona_id: string } }) {
    const { persona_id } = await params;
    let persona;
    try {
        persona = await getPersona(persona_id);
    } catch (error) {
        console.error('Failed to fetch persona:', error);
        throw new Error('Failed to load persona');
    }

    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center">
                <ConvAI/>
            </main>
        </div>
    );
}
