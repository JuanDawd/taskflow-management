'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMemo } from 'react'

export function ThemeToggle() {
	const { setTheme, theme } = useTheme()
	const themeIcon = useMemo(() => {
		switch (theme) {
			case 'light':
				return <Sun className="h-[1.2rem] w-[1.2rem]" />
			case 'dark':
				return <Moon className="h-[1.2rem] w-[1.2rem]" />
			default:
				return <Monitor className="h-[1.2rem] w-[1.2rem]" />
		}
	}, [theme])
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex gap-2">
					{themeIcon}
					<span className="">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" side="top">
				<DropdownMenuItem onClick={() => setTheme('light')}>
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
