export class CreateUserDto {
  readonly email: string
  readonly username: string
  readonly role?: string[]
}

export class UserLocationDto {
  readonly assemblyId: string
  readonly refSeq: string
  readonly start: string
  readonly end: string
}
