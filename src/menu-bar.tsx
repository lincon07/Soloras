"use client"

import {
    ContrastIcon,
    MoonIcon,
    SunIcon,
    ComputerIcon,
} from "lucide-react"
import { getCurrentWindow } from "@tauri-apps/api/window"

import { Menubar } from "@/components/ui/menubar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { useTheme } from "./providers/theme"

export function Menu() {
    const { setTheme } = useTheme()

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-10 select-none" data-tauri-drag-region>
            {/* 🔹 Drag region (background ONLY) */}
            <div
                data-tauri-drag-region
                className="absolute inset-0 h-10"
            />

            {/* 🔹 Actual UI (NOT draggable) */}
            <Menubar
                data-tauri-drag-region={false}
                className="relative h-10 border-b border-muted-foreground/20 px-2 bg-background"
            >
                <span className="flex items-center gap-2 px-2 text-sm font-medium">
                    Soloras
                </span>

                <div className="ml-auto flex items-center gap-1">
                    <DropdownMenu >
                        <DropdownMenuTrigger asChild >
                            <Button
                                data-tauri-drag-region={false}
                                variant="ghost"
                                size="icon"
                            >
                                <ContrastIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-56 backdrop-blur-sm shadow-xl">
                            <DropdownMenuLabel>Theme</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                <MoonIcon className="mr-2 h-4 w-4" />
                                Dark
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                <SunIcon className="mr-2 h-4 w-4" />
                                Light
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                <ComputerIcon className="mr-2 h-4 w-4" />
                                System
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </Menubar>
        </div>
    )
}
