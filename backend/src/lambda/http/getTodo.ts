import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodoForUser as getTodoForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
import { TodoItem } from '../../models/TodoItem'

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const todoId = event.pathParameters.todoId
    const userId: string = getUserId(event)
    const todo: TodoItem = await getTodoForUser(userId, todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        todo
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
