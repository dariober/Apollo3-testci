import { getConf } from '@jbrowse/core/configuration'
import { BaseInternetAccountModel } from '@jbrowse/core/pluggableElementTypes'
import { Region, getSession } from '@jbrowse/core/util'
import { AnnotationFeatureSnapshot } from 'apollo-mst'

import { SubmitOpts } from '../ChangeManager'
import { Change } from '../ChangeManager/Change'
import { ValidationResultSet } from '../Validations/ValidationSet'
import { BackendDriver } from './BackendDriver'

interface ApolloInternetAccount extends BaseInternetAccountModel {
  baseURL: string
}

export class CollaborationServerDriver extends BackendDriver {
  getInternetAccount(assemblyName?: string, internetAccountId?: string) {
    if (!(assemblyName || internetAccountId)) {
      throw new Error('Must provide either assemblyName or internetAccountId')
    }
    let configId = internetAccountId
    if (assemblyName && !configId) {
      const { assemblyManager } = getSession(this.clientStore)
      const assembly = assemblyManager.get(assemblyName)
      if (!assembly) {
        throw new Error(`No assembly found with name ${assemblyName}`)
      }
      ;({ internetAccountConfigId: configId } = getConf(assembly, [
        'sequence',
        'metadata',
      ]) as { internetAccountConfigId: string })
    }
    const { internetAccounts } = this.clientStore
    const internetAccount = internetAccounts.find(
      (ia) => getConf(ia, 'internetAccountId') === configId,
    ) as ApolloInternetAccount | undefined
    if (!internetAccount) {
      throw new Error(
        `No InternetAccount found with config id ${internetAccountId}`,
      )
    }
    return internetAccount
  }

  async fetch(
    internetAccount: ApolloInternetAccount,
    info: RequestInfo,
    init?: RequestInit,
  ) {
    const customFetch = internetAccount.getFetcher({
      locationType: 'UriLocation',
      uri: info.toString(),
    })
    return customFetch(info, init)
  }

  /**
   * Call backend endpoint to get features by criteria
   * @param region -  Searchable region containing refSeq, start and end
   * @returns
   */
  async getFeatures(region: Region) {
    const { assemblyName, refName, start, end } = region
    const { assemblyManager } = getSession(this.clientStore)
    const assembly = assemblyManager.get(assemblyName)
    if (!assembly) {
      throw new Error(`Could not find assembly with name "${assemblyName}"`)
    }
    const { features } = getConf(assembly, ['sequence', 'adapter']) as {
      features: {
        refName: string
        uniqueId: string
      }[]
    }
    const feature = features.find((f) => f.refName === refName)
    if (!feature) {
      throw new Error(`Could not find refSeq "${refName}"`)
    }
    const internetAccount = this.getInternetAccount(assemblyName)
    const { baseURL } = internetAccount
    const url = new URL('features/getFeatures', baseURL)
    const searchParams = new URLSearchParams({
      refSeq: feature.uniqueId,
      start: String(start),
      end: String(end),
    })
    url.search = searchParams.toString()
    const uri = url.toString()
    // console.log(`In CollaborationServerDriver: Query parameters: refSeq=${refSeq}, start=${start}, end=${end}`)

    const response = await this.fetch(internetAccount, uri)
    if (!response.ok) {
      let errorMessage
      try {
        errorMessage = await response.text()
      } catch (error) {
        errorMessage = ''
      }
      throw new Error(
        `getFeatures failed: ${response.status} (${response.statusText})${
          errorMessage ? ` (${errorMessage})` : ''
        }`,
      )
    }
    return response.json() as Promise<AnnotationFeatureSnapshot[]>
  }

  async getSequence(region: Region) {
    throw new Error('getSequence not yet implemented')
    return ''
  }

  async getRefSeqs() {
    throw new Error('getRefSeqs not yet implemented')
    return []
  }

  async submitChange(change: Change, opts: SubmitOpts = {}) {
    const { internetAccountId = undefined } = opts
    const internetAccount = this.getInternetAccount(
      change.assemblyId,
      internetAccountId,
    )
    const { baseURL } = internetAccount
    const url = new URL('changes', baseURL).href
    const response = await this.fetch(internetAccount, url, {
      method: 'POST',
      body: JSON.stringify(change.toJSON()),
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      let errorMessage
      try {
        errorMessage = await response.text()
      } catch (error) {
        errorMessage = ''
      }
      throw new Error(
        `submitChange failed: ${response.status} (${response.statusText})${
          errorMessage ? ` (${errorMessage})` : ''
        }`,
      )
    }
    const results = new ValidationResultSet()
    if (!response.ok) {
      results.ok = false
    }
    return results
  }
}
