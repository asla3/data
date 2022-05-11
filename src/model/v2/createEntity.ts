import get from 'lodash/get'
import type { ModelAst, Value } from './ModelAst'
import type { EntityContext } from './QueryableContext'

export type InitialValues<Ast extends ModelAst> = Ast extends ModelAst<
  infer Definition
>
  ? Partial<Value<Definition>>
  : never

export interface CreateEntityInput<Ast extends ModelAst = ModelAst> {
  ast: Ast
  initialValues?: InitialValues<Ast>
  context?: EntityContext
}

export function createEntity<Ast extends ModelAst>(
  input: CreateEntityInput<Ast>,
) {
  const entity = {}

  for (const token of input.ast.tokens) {
    const initialValue = get(input.initialValues || {}, token.location)
    token.set({
      ast: input.ast,
      entity,
      context: input.context,
      initialValue,
    })
  }

  if (input.context) {
    input.context.onEntityCreated(entity, input)
  }

  return entity
}
