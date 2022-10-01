import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
// import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    // TODO: Remove a TODO item by id
    const validTodoId = await todoExists(todoId)

    if (!validTodoId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }

    await docClient.delete({
      TableName: todosTable,
      Key: {
        id: todoId
      }
    }).promise()

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Todo item deleted'
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