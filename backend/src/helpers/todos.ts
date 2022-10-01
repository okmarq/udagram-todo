import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todoAccess = new TodoAccess()

export async function getAllTodos(): Promise<Todo[]> {
  return todoAccess.getAllTodos()
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<Todo> {

  const itemId = uuid.v4()
  const userId = getUserId(jwtToken)

  return await todoAccess.createTodo({
    id: itemId,
    userId: userId,
    name: createTodoRequest.name,
    description: createTodoRequest.description,
    timestamp: new Date().toISOString()
  })
}
