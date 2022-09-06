import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

    const validTodoId = await todoExists(todoId)

    if (!validTodoId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }

    // const getTodo = await docClient.query({
    //   TableName: todosTable,
    //   IndexName: process.env.TODOS_CREATED_AT_INDEX,
    //   KeyConditionExpression: 'userId = :userId',
    //   ExpressionAttributeValues: {
    //     ':userId': userId
    //   }
    // }).promise

    const todoPayload = {
      ...updatedTodo
    }

    await docClient
      .put({
        TableName: todosTable,
        Item: todoPayload
      })
      .promise()

    return {
      statusCode: 200,
      body: JSON.stringify({
        todoPayload
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

async function todoExists(todoId: string) {
  const result = await docClient.get({
    TableName: todosTable,
    Key: {
      id: todoId
    }
  }).promise()

  return !!result.Item
}