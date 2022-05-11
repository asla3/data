import { AnyObject } from 'src/glossary'
import { isObject } from '../../utils/isObject'
import { Token, TokenAttributes, TokenLocation } from './Token'

export type PrimitiveValue = string | number | boolean | Date
export type ModelValue = PrimitiveValue[] | PrimitiveValue
export type Getter<Value extends ModelValue = ModelValue> = () => Value

export type Value<Definition extends ModelDefinition> = {
  [K in keyof Definition]: Definition[K] extends TokenAttributes<infer Value>
    ? Value
    : Definition[K] extends Getter<infer Value>
    ? Value
    : Definition[K] extends AnyObject
    ? Partial<Value<Definition[K]>>
    : never
}

export interface ModelDefinition {
  [propertyName: string]: ModelDefinition | Getter | TokenAttributes<any>
}

export class ModelAst<Definition extends ModelDefinition = ModelDefinition> {
  public tokens: Token[]

  constructor(definition: Definition) {
    this.tokens = this.parseDefinition(definition)
  }

  private parseDefinition(
    definition: ModelDefinition,
    parentLoaction: TokenLocation = [],
    tokens: Token[] = [],
  ): Token[] {
    for (const [pointer, value] of Object.entries(definition)) {
      const location = parentLoaction.concat(pointer)

      // Token attributes.
      if (value instanceof TokenAttributes) {
        tokens.push(
          new Token({
            location,
            attributes: value,
          }),
        )
        continue
      }

      // Nested objects.
      if (isObject<ModelDefinition>(value)) {
        this.parseDefinition(value, location, tokens)
        continue
      }

      // Primitive values.
      tokens.push(
        new Token({
          location,
          attributes: new TokenAttributes(value),
        }),
      )
    }

    return tokens
  }
}
