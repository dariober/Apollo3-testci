import { Flags } from '@oclif/core'
import { fetch } from 'undici'

import { BaseCommand } from '../../baseCommand.js'
import {
  convertAssemblyNameToId,
  createFetchErrorMessage,
  idReader,
  localhostToAddress,
  queryApollo,
  wrapLines,
} from '../../utils.js'

export default class Check extends BaseCommand<typeof Check> {
  static summary = 'Get check results'
  static description = wrapLines(
    'Use this command to view which features fail checks along with the reason for failing.\
    Use `apollo assembly check` for managing which checks should be applied to an assembly',
  )

  static examples = [
    {
      description: 'Get all check results in the database:',
      command: '<%= config.bin %> <%= command.id %>',
    },
    {
      description: 'Get check results for assembly hg19:',
      command: '<%= config.bin %> <%= command.id %> -a hg19',
    },
  ]

  static flags = {
    'feature-id': Flags.string({
      char: 'i',
      description: 'Get checks for these feature identifiers',
      multiple: true,
    }),
    assembly: Flags.string({
      char: 'a',
      description: 'Get checks for this assembly',
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Check)

    const access: { address: string; accessToken: string } =
      await this.getAccess(flags['config-file'], flags.profile)

    let keepFeatures = new Set<string>()
    if (flags['feature-id'] !== undefined) {
      keepFeatures = new Set(idReader(flags['feature-id']))
    }

    const keepAsmId: string[] = await keepAssemblies(
      access.address,
      access.accessToken,
      flags.assembly,
    )

    const res = await queryApollo(access.address, access.accessToken, 'refseqs')
    const refseq = (await res.json()) as object[]
    const refseqId = new Set<string>()
    for (const x of refseq) {
      if (keepAsmId.includes(x['assembly' as keyof typeof x])) {
        refseqId.add(x['_id' as keyof typeof x])
      }
    }

    const checks: object[] = await getChecks(access.address, access.accessToken)
    const results: object[] = []
    for (const chk of checks) {
      let keep = false
      if (flags['feature-id'] === undefined) {
        keep = true
      } else {
        for (const x of chk['ids' as keyof typeof chk] as string[]) {
          if (keepFeatures.has(x)) {
            keep = true
            break
          }
        }
      }
      if (keep && refseqId.has(chk['refSeq' as keyof typeof chk])) {
        results.push(chk)
      }
    }
    this.log(JSON.stringify(results, null, 2))
  }
}

async function keepAssemblies(
  address: string,
  accessToken: string,
  assembly: string | undefined,
): Promise<string[]> {
  let keepAssembly: string[] = []
  if (assembly === undefined) {
    const res = await queryApollo(address, accessToken, 'assemblies')
    const asm = (await res.json()) as object[]
    for (const x of asm) {
      keepAssembly.push(x['_id' as keyof typeof x])
    }
  } else {
    const ids = idReader([assembly])
    keepAssembly = await convertAssemblyNameToId(address, accessToken, ids)
  }
  return keepAssembly
}

async function getChecks(address: string, token: string): Promise<object[]> {
  const url = new URL(localhostToAddress(`${address}/checks`))
  const auth = {
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
  const response = await fetch(url, auth)
  if (!response.ok) {
    const errorMessage = await createFetchErrorMessage(
      response,
      'Failed to access Apollo with the current address and/or access token\nThe server returned:\n',
    )
    throw new Error(errorMessage)
  }
  return (await response.json()) as object[]
}
