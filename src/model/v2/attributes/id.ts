import has from 'lodash/has'
import get from 'lodash/get'
import { invariant } from 'outvariant'
import type { Getter } from '../ModelAst'
import { QueryableContext } from '../QueryableContext'
import { TokenAttributes, TokenAttributesWillSetInput } from '../Token'

export function id(getter: Getter<string>): IdentifierAttributes {
  return new IdentifierAttributes(getter)
}

export class IdentifierAttributes extends TokenAttributes<
  string,
  QueryableContext
> {
  public willSet({
    ast,
    token,
    entity,
    context,
    value,
  }: TokenAttributesWillSetInput<string, QueryableContext>): boolean {
    // Identifier must be defined in a queryable context.
    invariant(
      context instanceof QueryableContext,
      'Failed to set identifier at "%s": missing context.',
      token.pointer,
    )

    // Identifier must have value.
    invariant(
      value,
      'Failed to set identifier at "%s": identifier value was not provided.',
      token.pointer,
    )

    // Identifier must be assigned only to a single property in the model.
    const existingPrimaryKey = ast.tokens.find((otherToken) => {
      return (
        otherToken.pointer !== token.pointer &&
        otherToken.attributes instanceof IdentifierAttributes &&
        has(entity, otherToken.pointer)
      )
    })

    invariant(
      existingPrimaryKey == null,
      'Failed to set identifier at "%s" ("%s"): entity already has identifier "%s" ("%s").',
      token.pointer,
      value,
      existingPrimaryKey?.pointer,
      get(entity, existingPrimaryKey?.pointer || []),
    )

    return true
  }
}
