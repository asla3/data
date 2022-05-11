import set from 'lodash/set'
import type { ModelValue, Getter, ModelAst } from './ModelAst'
import { EntityContext } from './QueryableContext'

export type TokenLocation = string[]

type TokenInput = {
  location: TokenLocation
  attributes: TokenAttributes<any>
}

export interface TokenSetInput<Value extends ModelValue> {
  ast: ModelAst
  entity: any
  context?: EntityContext
  initialValue?: Value
}

export class Token<Value extends ModelValue = ModelValue> {
  public readonly location: TokenLocation
  public readonly attributes: TokenAttributes<Value, EntityContext>

  constructor(input: TokenInput) {
    this.location = input.location
    this.attributes = input.attributes
  }

  public get pointer(): string {
    return this.location.join('.')
  }

  public set(input: TokenSetInput<Value>) {
    const value = input.initialValue ?? this.attributes.value()

    if (
      this.attributes.willSet({
        ast: input.ast,
        token: this,
        entity: input.entity,
        context: input.context,
        value,
        initialValue: input.initialValue,
      })
    ) {
      set(input.entity, this.location, value)
    }
  }
}

/**
 * Token Attributes.
 */
export interface TokenAttributesWillSetInput<
  Value extends ModelValue,
  Context extends EntityContext = never,
> {
  ast: ModelAst
  token: Token<Value>
  entity: any
  context?: Context
  value: Value
  initialValue?: Value
}

export class TokenAttributes<
  Value extends ModelValue,
  Context extends EntityContext = never,
> {
  constructor(public readonly value: Getter<Value>) {}

  /**
   * Controls whether the token should be set on the entity.
   */
  public willSet(input: TokenAttributesWillSetInput<Value, Context>): boolean {
    return true
  }
}
