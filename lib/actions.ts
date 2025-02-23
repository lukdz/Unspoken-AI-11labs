'use server'

import OpenAI from "openai";
import { conversational_ai_prompt_generator, detect_if_language_is_english_prompt, final_11labs_prompt, style_extractor_agent_prompt, translate_prompt } from "./prompts";
import { ElevenLabsClient } from "elevenlabs";
import { addPersona } from "./database";
import { Persona } from "./types";
import ISO6391 from 'iso-639-1';

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

function convertToLanguageCode(languageName: string): string {
    try {
        // Clean up the input string and get just the language name
        const cleanLanguage = languageName.trim().toLowerCase().replace(/[^a-zA-Z ]/g, '');
        const code = ISO6391.getCode(cleanLanguage);
        if (!code) {
            console.error(`Could not find language code for: ${languageName}, falling back to 'en'`);
            return 'en';
        }
        return code;
    } catch (error) {
        console.error(`Error converting language name to code: ${error}`);
        return 'en';
    }
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

    const person_name = formData.name;
    
    // Start voice creation early and let it run in parallel
    const voiceIDPromise = addVoice(formData.file, person_name);

    let style_extractor_prompt = style_extractor_agent_prompt.replaceAll('{person_name}', person_name);
    let conv_ai_prompt_gen_prompt = conversational_ai_prompt_generator;
    let final_prompt = final_11labs_prompt.replaceAll('{person_name}', person_name);
    let init_message = `Hello, I am ${person_name}. It's really nice to see you again!`;

    const recognized_language = await openaiCompletion(detect_if_language_is_english_prompt, formData.description);
    const languageCode = convertToLanguageCode(recognized_language);
    
    if (languageCode !== 'en') {
        console.log(`Recognized non english language (${recognized_language} -> ${languageCode}), translating texts...`)

        const tr_prompt = translate_prompt.replaceAll("{language}", recognized_language);
        [style_extractor_prompt, conv_ai_prompt_gen_prompt, final_prompt, init_message] = await Promise.all([
            openaiCompletion(tr_prompt, style_extractor_prompt),
            openaiCompletion(tr_prompt, conv_ai_prompt_gen_prompt),
            openaiCompletion(tr_prompt, final_prompt),
            openaiCompletion(tr_prompt, init_message)
        ]);

        console.log(`\n\nTranslated text:${style_extractor_prompt}`)
        console.log(`\n\nTranslated text:${conv_ai_prompt_gen_prompt}`)
        console.log(`\n\nTranslated text:${final_prompt}`)
        console.log(`\n\nTranslated text:${init_message}`)
    }

    // Run the OpenAI operations sequentially since they depend on each other
    const extractedData = await openaiCompletion(style_extractor_prompt, formData.description);
    const prompt = await openaiCompletion(conv_ai_prompt_gen_prompt, extractedData);
    
    const system_prompt = `${final_prompt}\n${prompt}`;

    // Wait for both voice creation and agent creation to complete
    const voice_id = await voiceIDPromise;//'0JYdul3VlZWMx8Zex8L4';//
    const agent_id = await createAgent(system_prompt, init_message, voice_id, person_name, languageCode);

    const uuid = crypto.randomUUID();
    console.log("Finished crafting persona ", uuid);

    console.log(extractedData);
    console.log("-------------------");
    console.log(system_prompt);

    const persona: Omit<Persona, 'created_at'> = {
        id: uuid,
        voice_id: voice_id,
        person_name: person_name,
        source_text: formData.description,
        system_prompt: system_prompt,
        agent_id: agent_id
    };

    await addPersona(persona);
    return uuid;
}

async function addVoice(file: File, voiceName: string): Promise<string> {
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

async function createAgent(prompt: string, first_message: string, voice_id: string, internal_name: string, language: string = "en") {
    console.log("Adding new agent...")

    const apiKey = process.env.XI_API_KEY
    if (!apiKey) {
        throw Error('XI_API_KEY is not set')
    }

    const client = new ElevenLabsClient({ apiKey: apiKey });
    const res = await client.conversationalAi.createAgent({
        conversation_config: {
            agent: {
                prompt: {
                    prompt: prompt,
                    //llm
                    //temperature
                    //tools
                    //knowledge_base
                },
                first_message: first_message,
                language: language
            },
            tts: {
                voice_id: voice_id,
                model_id: language == 'en' ? undefined : 'eleven_turbo_v2_5'
                //model_id: 'eleven_multilingual_v2'
            }
        },
        name: internal_name
    });
    return res.agent_id;
}

export async function getSignedUrl(agent_id: string) {
    if (!agent_id) {
        throw Error('AGENT_ID is not set')
    }
    const apiKey = process.env.XI_API_KEY
    if (!apiKey) {
        throw Error('XI_API_KEY is not set')
    }
    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agent_id}`,
            {
                method: 'GET',
                headers: {
                    'xi-api-key': apiKey,
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to get signed URL');
        }

        const data = await response.json();
        return data.signed_url
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}