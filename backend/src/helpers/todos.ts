import { TodoAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import * as AWS from 'aws-sdk'

// TODO: Implement businessLogic

const todoAccess = new TodoAccess()

const logger = createLogger('todos')

export async function getTodosForUser(user: string): Promise<TodoItem[]> {
	const userId: string = user
	try {
		logger.info('Successfully retrieved todolist')
		return todoAccess.getTodos(userId)
	} catch (error) {
		logger.error(`Error: ${error.message}`)
	}
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
	try {
		logger.info('Successfully created a new todo item.')

		return todoAccess.createTodo(newTodo)
	} catch (error) {
		logger.error(`Error: ${error.message}`)
	}
}

export async function updateTodo(
	user: string,
	todoId: string,
	updateData: UpdateTodoRequest
): Promise<void> {
	const userId = user
	try {
		return todoAccess.updateTodo(userId, todoId, updateData)
	} catch (error) {
		logger.error(`Error: ${error.message}`)
	}
}

export async function deleteTodo(user: string, todoId: string): Promise<void> {
	const userId = user
	logger.info(`Successfully deleted todo item: ${todoId}`)
	return todoAccess.deleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(user: string, todoId: string): Promise<string> {
	const userId = user
	const bucketName = process.env.IMAGES_S3_BUCKET
	const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10)
	const s3 = new AWS.S3({ signatureVersion: 'v4' })
	const signedUrl = s3.getSignedUrl('putObject', {
		Bucket: bucketName,
		Key: todoId,
		Expires: urlExpiration
	})
	try {
		await todoAccess.saveImgUrl(userId, todoId, bucketName)
		logger.info('Successfully created signed url.')
		return signedUrl
	} catch (error) {
		logger.error(`Error: ${error.message}`)
	}
}