import { GFF3FeatureLineWithRefs, GFF3Item } from '@gmod/gff'
import { getConf } from '@jbrowse/core/configuration'
import { BaseInternetAccountModel } from '@jbrowse/core/pluggableElementTypes'
import { AppRootModel, Region } from '@jbrowse/core/util'
import { SnapshotIn, getRoot } from 'mobx-state-tree'

import { AnnotationFeature } from '../BackendDrivers/AnnotationFeature'
import { Change } from '../ChangeManager/Change'
import { ValidationResultSet } from '../Validations/ValidationSet'
import { BackendDriver } from './BackendDriver'

export class CollaborationServerDriver extends BackendDriver {
  /**
   * Call backend endpoint to get features by criteria
   * @param region -  Searchable region containing refName, start and end
   * @returns
   */
  async getFeatures(region: Region) {
    const { refName, start, end } = region
    const { internetAccountConfigId } = this.clientStore
    const { internetAccounts } = getRoot(this.clientStore) as AppRootModel
    const internetAccount = internetAccounts.find(
      (ia) => getConf(ia, 'internetAccountId') === internetAccountConfigId,
    )
    if (!internetAccount) {
      throw new Error(
        `No InternetAccount found with config id ${internetAccountConfigId}`,
      )
    }
    const { baseURL } = internetAccount as BaseInternetAccountModel & {
      baseURL: string
    }

    // ************** KS TEMP COMMENT BEGINS ***************
    // const url = new URL('filehandling/getFeaturesByCriteria', baseURL)
    // const searchParams = new URLSearchParams({
    //   seq_id: refName,
    //   start: String(start),
    //   end: String(end),
    // })
    // url.search = searchParams.toString()
    // ************** KS TEMP COMMENT ENDS ***************    
    const url = 'filehandling/getFeaturesByCriteria'




    const uri = url.toString()
    const fetch = internetAccount.getFetcher({
      locationType: 'UriLocation',
      uri,
    })
    // console.log(`In CollaborationServerDriver: Query parameters: refName=${refName}, start=${start}, end=${end}`)

    const result = await fetch(uri)
    const data = (await result.json()) as GFF3Item[]
    // const backendResult = JSON.stringify(data)
    // console.log(
    //   `In CollaborationServerDriver: Backend endpoint returned=${backendResult}`,
    // )
    const allFeatures = makeFeatures(data, 'volvox')

    return { [refName]: allFeatures[refName] }
  }

  async getSequence(region: Region) {
    throw new Error('getSequence not yet implemented')
    return ''
  }

  async getRefNames() {
    throw new Error('getRefNames not yet implemented')
    return []
  }

  async submitChange(change: Change) {
    return new ValidationResultSet()
  }
}

function makeFeatures(gff3Contents: GFF3Item[], assemblyName: string) {
  const featuresByRefName: Record<
    string,
    Record<string, SnapshotIn<typeof AnnotationFeature> | undefined> | undefined
  > = {}
  for (const gff3Item of gff3Contents) {
    if (Array.isArray(gff3Item)) {
      gff3Item.forEach((feature) => {
        if (!feature.seq_id) {
          throw new Error('Got GFF3 record without an ID')
        }
        if (!feature.type) {
          throw new Error('Got GFF3 record without a type')
        }
        const convertedFeature = convertFeature(feature, assemblyName)
        const { refName } = convertedFeature.location
        let refRecord = featuresByRefName[refName]
        if (!refRecord) {
          refRecord = {}
          featuresByRefName[refName] = refRecord
        }
        refRecord[convertedFeature.id] = convertedFeature
      })
    }
  }
  return featuresByRefName
}

function convertFeature(
  feature: GFF3FeatureLineWithRefs,
  assemblyName: string,
): SnapshotIn<typeof AnnotationFeature> {
  if (!feature.seq_id) {
    throw new Error('Got GFF3 record without an ID')
  }
  if (!feature.type) {
    throw new Error('Got GFF3 record without a type')
  }
  if (!feature.start) {
    throw new Error('Got GFF3 record without a start')
  }
  if (!feature.end) {
    throw new Error('Got GFF3 record without an end')
  }
  const id = feature.attributes?.apollo_id?.[0]
  if (!id) {
    throw new Error('Apollo feature without apollo_id encountered')
  }
  const children: Record<string, SnapshotIn<typeof AnnotationFeature>> = {}
  feature.child_features.forEach((childFeatureLocation) => {
    childFeatureLocation.forEach((childFeature) => {
      const childFeat = convertFeature(childFeature, assemblyName)
      children[childFeat.id] = childFeat
    })
  })
  const newFeature: SnapshotIn<typeof AnnotationFeature> = {
    id,
    assemblyName,
    location: {
      refName: feature.seq_id,
      start: feature.start,
      end: feature.end,
    },
  }
  if (Array.from(Object.entries(children)).length) {
    newFeature.children = children
  }
  return newFeature
}
