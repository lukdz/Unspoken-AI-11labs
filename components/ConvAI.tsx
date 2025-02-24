"use client"

import {Button} from "@/components/ui/button";
import * as React from "react";
import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Conversation} from "@11labs/client";
import {cn} from "@/lib/utils";
import { getSignedUrl } from "@/lib/actions";
import { Persona } from "@/lib/types";

async function requestMicrophonePermission() {
    try {
        await navigator.mediaDevices.getUserMedia({audio: true})
        return true
    } catch {
        console.error('Microphone permission denied')
        return false
    }
}

export function ConvAI({ persona }: { persona: Persona }) {
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [elevenLabsKey, setElevenLabsKey] = useState('')
    const [keyError, setKeyError] = useState(false)

    async function startConversation() {
        if (!elevenLabsKey) {
            setKeyError(true)
            return
        }
        setKeyError(false)

        const hasPermission = await requestMicrophonePermission()
        if (!hasPermission) {
            alert("No permission")
            return;
        }
        const signedUrl = await getSignedUrl(persona.agent_id, elevenLabsKey)
        const conversation = await Conversation.startSession({
            signedUrl: signedUrl,
            onConnect: () => {
                setIsConnected(true)
                setIsSpeaking(true)
            },
            onDisconnect: () => {
                setIsConnected(false)
                setIsSpeaking(false)
            },
            onError: (error) => {
                console.log(error)
                alert('An error occurred during the conversation')
            },
            onModeChange: ({mode}) => {
                setIsSpeaking(mode === 'speaking')
            },
        })
        setConversation(conversation)
    }

    async function endConversation() {
        if (!conversation) {
            return
        }
        await conversation.endSession()
        setConversation(null)
    }

    return (
        <div className={"flex justify-center items-center gap-x-4 flex-col"}>
            <h1 className={'text-3xl font-bold p-10'}>Talk to {persona.person_name}</h1>
            <Card className={'rounded-3xl'}>
                <CardContent>
                    <CardHeader>
                        <CardTitle className={'text-center'}>
                            {isConnected ? (
                                isSpeaking ? `Agent is speaking` : 'Agent is listening'
                            ) : (
                                'Disconnected'
                            )}
                        </CardTitle>
                    </CardHeader>
                    <div className={'flex flex-col gap-y-4 text-center'}>
                        <div className={cn('orb my-16 mx-12',
                            isSpeaking ? 'animate-orb' : (conversation && 'animate-orb-slow'),
                            isConnected ? 'orb-active' : 'orb-inactive')}
                        ></div>

                        <div className="w-full relative px-4">
                            <p className="mb-2 text-gray-700">ElevenLabs API Key</p>
                            <input
                                type="password" 
                                placeholder="Enter your ElevenLabs API key"
                                className={`w-full p-2 border rounded-md ${keyError ? 'border-red-500' : ''}`}
                                value={elevenLabsKey}
                                onChange={(e) => setElevenLabsKey(e.target.value)}
                            />
                            {keyError && <div className="text-red-500 text-sm mt-1">Please enter your ElevenLabs API key</div>}
                        </div>

                        <Button
                            variant={'outline'}
                            className={'rounded-full'}
                            size={"lg"}
                            disabled={conversation !== null && isConnected}
                            onClick={startConversation}
                        >
                            Start conversation
                        </Button>
                        <Button
                            variant={'outline'}
                            className={'rounded-full'}
                            size={"lg"}
                            disabled={conversation === null && !isConnected}
                            onClick={endConversation}
                        >
                            End conversation
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}