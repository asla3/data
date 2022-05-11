import { Database } from './Database'
import { CreateEntityInput } from './createEntity'
import { IdentifierAttributes } from './attributes/id'

export const MODEL_NAME = Symbol('modelName')
export const IDENTIFIER = Symbol('identifier')

export abstract class EntityContext {
  public onEntityCreated(entity: any, input: CreateEntityInput) {}
}

interface QueryableContextInput {
  modelName: string
  db: Database
}

export class QueryableContext extends EntityContext {
  public readonly modelName: string
  public readonly db: Database

  constructor(input: QueryableContextInput) {
    super()
    this.modelName = input.modelName
    this.db = input.db
  }

  public onEntityCreated(entity: any, input: CreateEntityInput) {
    const identifierToken = input.ast.tokens.find(
      (token) => token.attributes instanceof IdentifierAttributes,
    )

    // Assign entity meta data used for querying.
    const queryableEntity = Object.assign({}, entity, {
      [MODEL_NAME]: this.modelName,
      [IDENTIFIER]: identifierToken?.location[0],
    })

    // Store the created entity in the database.
    this.db.create(this.modelName, queryableEntity)
  }
}
