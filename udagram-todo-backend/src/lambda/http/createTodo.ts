import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const timestamp = new Date().toISOString()
    const userId = getUserId(event)
    // TODO: Implement creating a new TODO item
    const todoPayload = {
      "createdAt": timestamp,
      ...newTodo,
      "userId": userId,
      "done": false,
      "attachmentUrl": ""
    }
    await docClient
      .put({
        TableName: todosTable,
        Item: todoPayload
      })
      .promise()
    return {
      statusCode: 201,
      body: JSON.stringify({
        todoPayload
      })
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
