import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodoAccess {

	constructor(
		private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
		private readonly todosTable = process.env.TODOS_TABLE) { }

	async getTodos(userId: string): Promise<TodoItem[]> {
		logger.info(`Getting all todos belonging to user: ${userId}`)
		const result = await this.docClient
			.query({
				TableName: this.todosTable,
				IndexName: process.env.TODOS_CREATED_AT_INDEX,
				KeyConditionExpression: 'userId = :userId',
				ExpressionAttributeValues: {
					':userId': userId
				}
			})
			.promise()
		return result.Items as TodoItem[]
	}

	async getTodo(userId: string, todoId: string): Promise<TodoItem> {
		logger.info(`Getting todo item: ${todoId} for user: ${userId}`)
		const result = await this.docClient
			.query({
				TableName: this.todosTable,
				IndexName: process.env.TODOS_CREATED_AT_INDEX,
				KeyConditionExpression: 'userId = :userId and todoId = :todoId',
				ExpressionAttributeValues: {
					':userId': userId,
					':todoId': todoId
				}
			})
			.promise()
		return result.Items[0] as TodoItem
	}

	async createTodo(newTodo: TodoItem): Promise<TodoItem> {
		logger.info(`Creating new todo item: ${newTodo.todoId}`)
		await this.docClient
			.put({
				TableName: this.todosTable,
				Item: newTodo
			})
			.promise()
		return newTodo
	}

	async updateTodo(userId: string, todoId: string, updateData: TodoUpdate): Promise<void> {
		logger.info(`Updating a todo item: ${todoId}`)
		await this.docClient
			.update({
				TableName: this.todosTable,
				Key: { userId, todoId },
				ConditionExpression: 'attribute_exists(todoId)',
				UpdateExpression: 'set name = :name, dueDate = :dueDate, done = :done',
				ExpressionAttributeValues: {
					':name': updateData.name,
					':dueDate': updateData.dueDate,
					':done': updateData.done
				}
			})
			.promise()
	}

	async deleteTodo(userId: string, todoId: string): Promise<void> {
		await this.docClient
			.delete({
				TableName: this.todosTable,
				Key: { userId, todoId }
			})
			.promise()
	}

	async saveImgUrl(userId: string, todoId: string, bucketName: string): Promise<void> {
		await this.docClient
			.update({
				TableName: this.todosTable,
				Key: { userId, todoId },
				ConditionExpression: 'attribute_exists(todoId)',
				UpdateExpression: 'set attachmentUrl = :attachmentUrl',
				ExpressionAttributeValues: {
					':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
				}
			})
			.promise()
	}
}