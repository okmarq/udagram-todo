import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const timestamp = new Date().toISOString()
    // TODO: Implement creating a new TODO item

    const todoPayload = {
      "createdAt": timestamp,
      ...newTodo,
      "done": false,
      "attachmentUrl": "http://example.com/image.png"
    }

    await this.dynamoDBClient
      .put({
        TableName: process.env.TODOS_TABLE,
        Todo: todoPayload
      })
      .promise()

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        todoPayload
      })
    }
)

handler.use(
  cors({
    credentials: true
  })
)
