import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
	try {
		const data = await request.formData()
		const file: File | null = data.get('file') as unknown as File

		if (!file) {
			return NextResponse.json({ error: 'No file received' }, { status: 400 })
		}

		// Validate file size (10MB max)
		const maxSize = 10 * 1024 * 1024
		if (file.size > maxSize) {
			return NextResponse.json({ error: 'File too large' }, { status: 400 })
		}

		// Validate file type
		const allowedTypes = [
			'image/',
			'application/pdf',
			'text/',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument',
		]
		const isAllowed = allowedTypes.some((type) => file.type.startsWith(type))

		if (!isAllowed) {
			return NextResponse.json(
				{ error: 'File type not allowed' },
				{ status: 400 },
			)
		}

		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)

		// Create uploads directory if it doesn't exist
		const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
		await mkdir(uploadsDir, { recursive: true })

		// Generate unique filename
		const fileExtension = path.extname(file.name)
		const fileName = `${uuidv4()}${fileExtension}`
		const filePath = path.join(uploadsDir, fileName)

		// Write file to disk
		await writeFile(filePath, buffer)

		// Return file URL
		const fileUrl = `/uploads/${fileName}`

		return NextResponse.json({
			url: fileUrl,
			name: file.name,
			size: file.size,
			type: file.type,
		})
	} catch (error) {
		console.error('Error uploading file:', error)
		return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
	}
}
