'use server'

import OpenAI from "openai";
import { conversational_ai_prompt_generator, final_11labs_prompt, style_extractor_agent_prompt } from "./prompts";
import { ElevenLabsClient } from "elevenlabs";
import { addPersona } from "./database";
import { Persona } from "./types";

const openai = new OpenAI();

async function openaiCompletion(prompt: string, userMessage: string): Promise<string> {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { 
                role: "system", 
                content: prompt
            },
            {
                role: "user",
                content: userMessage
            }
        ],
    });

    return completion.choices[0].message.content || "Failed to run AI completion";
}

export async function createVirtualClone(formData: {
    name: string;
    description: string;
    file: File;
}) {
    if (!formData.file) {
        console.error("Cannot create voice - no file provided")
        return;
    }

    const voiceID = await addVoice(formData.file, formData.name);

    const extratedData = await openaiCompletion(style_extractor_agent_prompt, formData.description);
    const prompt = await openaiCompletion(conversational_ai_prompt_generator, extratedData);
    const final_prompt = final_11labs_prompt.replaceAll('{person_name}', formData.name).replaceAll('{prompt}', prompt)

    const uuid = crypto.randomUUID();

    console.log("Finished crafting persona ", uuid);

    const persona: Omit<Persona, 'created_at'> = {
        id: uuid,
        voice_id: voiceID,
        person_name: formData.name,
        source_text: formData.description,
        system_prompt: final_prompt,
        agent_id: "11labs"//TODO
    };

    await addPersona(persona);
    return uuid;
}

export async function addVoice(file: File, voiceName: string): Promise<string> {
    console.log("Adding new voice...")

    const apiKey = process.env.XI_API_KEY
    if (!apiKey) {
        throw Error('XI_API_KEY is not set')
    }

    const client = new ElevenLabsClient({ apiKey: apiKey });
    
    try {
        const response = await client.voices.add({
            files: [file],
            name: voiceName,
            remove_background_noise: true
        });
        await client.voices.editSettings(response.voice_id, {
            stability: 0.1,
            similarity_boost: 0.9,
            style: 0.2
        });
        return response.voice_id;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to add voice: ${errorMessage}`);
    }
}

// Example usage:
// const voiceId = await addVoice(fileObject, "Custom Voice Name");

export async function createAgent(prompt: string, first_message: string = "", language: string = "en") {
    console.log("Adding new agent...")

    const apiKey = process.env.XI_API_KEY
    if (!apiKey) {
        throw Error('XI_API_KEY is not set')
    }

    const client = new ElevenLabsClient({ apiKey: apiKey });
    await client.conversationalAi.createAgent({
        conversation_config: {
            agent: {
                prompt: prompt,
                first_message: first_message,
                language: language
            }
        }
    });
}
