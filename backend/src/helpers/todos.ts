import { TodoAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic

const todoAccess = new TodoAccess()

const logger = createLogger('todos')

export async function getTodos(user: string): Promise<TodoItem[]> {
	const userId: string = user
	return todoAccess.getTodos(userId)
}

export async function getTodo(user: string, todoId: string): Promise<TodoItem> {
	const userId: string = user
	return todoAccess.getTodo(userId, todoId)
}

export async function createTodo(user: string, newTodoData: CreateTodoRequest): Promise<TodoItem> {
	const todoId = uuid.v4()
	const userId = user
	const createdAt = new Date().toISOString()
	const done = false
	const newTodo: TodoItem = { todoId, userId, createdAt, done, ...newTodoData }

	logger.info('Successfully created a new todo item.')

	return todoAccess.createTodo(newTodo)
}

export async function updateTodo(
	user: string,
	todoId: string,
	updateData: UpdateTodoRequest
): Promise<void> {
	const userId = user
	return todoAccess.updateTodo(userId, todoId, updateData)
}

export async function deleteTodo(user: string, todoId: string): Promise<void> {
	const userId = user
	return todoAccess.deleteTodo(userId, todoId)
}

export async function generateUploadUrl(user: string, todoId: string): Promise<string> {
	const userId = user
	const bucketName = process.env.IMAGES_S3_BUCKET
	const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10)
	const s3 = new AWS.S3({ signatureVersion: 'v4' })
	const signedUrl = s3.getSignedUrl('putObject', {
		Bucket: bucketName,
		Key: todoId,
		Expires: urlExpiration
	})
	await todoAccess.saveImgUrl(userId, todoId, bucketName)
	return signedUrl
}