import { factory, nullable, primaryKey } from 'src'

it('creates a nullable object', () => {
  const db = factory({
    user: {
      id: primaryKey(String),
      permissions: nullable(() => ({
        id: String,
      })),
    },
  })

  const user = db.user.create({ id: 'abc-123' })

  console.log(user)
})
