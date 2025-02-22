'use server'

import OpenAI from "openai";
import { conversational_ai_prompt_generator, final_11labs_prompt, style_extractor_agent_prompt } from "./prompts";

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
    const extratedData = await openaiCompletion(style_extractor_agent_prompt, formData.description);
    const prompt = await openaiCompletion(conversational_ai_prompt_generator, extratedData);
    const final_prompt = final_11labs_prompt.replaceAll('{person_name}', formData.name).replaceAll('{prompt}', prompt)
    console.log(final_prompt);
    return '12314532453425'; // Temporary ID, to be changed later
}
