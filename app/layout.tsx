import type {Metadata} from "next";
import "./globals.css";
import {BackgroundWave} from "@/components/background-wave";
import Link from "next/link";
import { AnalyticsProvider } from '@/components/providers/analytics-provider'

export const metadata: Metadata = {
    title: "Memoria AI",
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={"h-full w-full"}>
            <body>
                <AnalyticsProvider>
                    <div className="flex flex-col flex-grow w-full items-center justify-center sm:px-4">
                        <nav className={"sm:fixed w-full top-0 left-0 grid grid-cols-2 py-4 px-8"}>
                            <div className={"flex"}>
                                <Link href={"/"} prefetch={true}>
                                    <p className="text-lg font-bold">Unspoken AI</p>
                                </Link>
                            </div>
                        </nav>
                        <div className="flex items-center mx-auto">
                            {children}
                        </div>
                        <BackgroundWave/>
                    </div>
                </AnalyticsProvider>
            </body>
        </html>
    );
}
