import { OboJson } from 'apollo-common'
import { GOTerm } from './ModifyFeatureAttribute'

let dbVersion = 1

export interface GOTermDb {
  id: string
  goId: string
  description: string
}

export enum Stores {
  GOTerms = 'goTerms',
}
export const goDbName = 'goDB'

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const request = indexedDB.open(goDbName)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(Stores.GOTerms)) {
        // console.log('Creating GOTerms store')
        db.createObjectStore(Stores.GOTerms, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => {
      const db = request.result
      dbVersion = db.version
      // console.log('Database is now initialized')
      resolve(true)
    }

    request.onerror = () => {
      resolve(false)
    }
  })
}

export const addBatchData = (
  storeName: string,
  data: GOTerm[],
): Promise<number> => {
  return new Promise((resolve) => {
    const request = indexedDB.open(goDbName, dbVersion)
    console.debug('Adding GO terms into database...')
    request.onsuccess = () => {
      const db = request.result
      let id = Date.now()
      let cnt = 0
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      data.forEach((item) => {
        store.add({ id, goId: item.id, description: item.label })
        id++
        cnt++
      })
      resolve(cnt)
    }
    request.onerror = () => {
      const error = request.error?.message
      if (error) {
        console.error(`ERROR when adding GO terms into database: ${error}`)
      }
    }
  })
}

export const readFileSync = async (fileLocation: URL) => {
  let fileContent = ''
  try {
    const response = await fetch(fileLocation)
    fileContent = await response.text()
  } catch (error) {
    console.error('Error fetching file:', error)
  }
  return fileContent
}

export const getStoreDataCount = (): Promise<number> => {
  return new Promise((resolve) => {
    const request = indexedDB.open(goDbName)
    request.onsuccess = () => {
      const db = request.result
      const objectStore = db
        .transaction(Stores.GOTerms, 'readonly')
        .objectStore(Stores.GOTerms)
      const countRequest = objectStore.count()
      countRequest.onsuccess = () => {
        const count = countRequest.result
        // console.log(`There are ${count} records in the database.`)
        resolve(count)
      }
      countRequest.onerror = () => {
        console.error('Error counting records:', countRequest.error)
      }
    }
  })
}
export const getDataByIdOrDesc = (
  storeName: Stores,
  searchStr: string,
  limit = 40,
): Promise<GOTerm[]> => {
  return new Promise((resolve) => {
    const request = indexedDB.open(goDbName)

    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const matchingRecords: GOTerm[] = []

      store.openCursor().onsuccess = async (event: Event) => {
        const cursor = await (event.target as unknown as IDBRequest).result
        if (cursor) {
          const record = cursor.value
          const idVal: string = record.goId
          let descVal: string = record.description
          if (!descVal) {
            descVal = ''
          }
          if (
            idVal.toLowerCase().includes(searchStr.toLowerCase()) ||
            descVal.toLowerCase().includes(searchStr.toLowerCase())
          ) {
            const newObject: GOTerm = { id: idVal, label: descVal }
            const alreadyAdded =
              matchingRecords.find((a) => a.id === newObject.id) !== undefined
            if (!alreadyAdded) {
              matchingRecords.push(newObject)
            }
          }
          if (matchingRecords.length >= limit) {
            resolve(matchingRecords)
          } else {
            cursor.continue()
          }
        } else {
          resolve(matchingRecords)
        }
      }
    }
  })
}

export async function load() {
  // GO stuff starts here
  await initDB()
  const recCount = await getStoreDataCount()
  if (recCount) {
    return
  }
  const { jbrowse } = getRoot(self)
  const { configuration } = jbrowse
  const location = readConfObject(configuration, ['ApolloPlugin', 'goLocation'])
  if ('uri' in location && location.uri === '') {
    return
  }
  const goTermsArray: { id: string; label: string }[] = []
  try {
    const ontologyText = await openLocation(location).readFile('utf8')
    if (ontologyText) {
      const ontologyJson = JSON.parse(ontologyText) as OboJson
      const ontology: OboJson = ontologyJson
      // Iterate over the nodes and edges in the JSON file
      for (const node of ontology.graphs[0].nodes) {
        if (node.id.startsWith('http://purl.obolibrary.org/obo/GO_')) {
          const { meta } = node
          let labelText = node.lbl
          if (meta.hasOwnProperty('deprecated')) {
            const tmpObj = JSON.parse(JSON.stringify(meta))
            if (tmpObj.deprecated === true) {
              labelText = '*** This term is deprecated ***'
            }
          }
          goTermsArray.push({
            id: node.id.replace('http://purl.obolibrary.org/obo/GO_', 'GO:'),
            label: labelText,
          })
        }
      }
    }
  } catch (error) {
    console.error(`Error loading ontology file: ${error}`)
    throw error
  }
  if (goTermsArray.length > 0) {
    console.debug(`Fetched ${goTermsArray.length} GO terms`)
    const start = Date.now()
    const res = await addBatchData(Stores.GOTerms, goTermsArray)
    const end = Date.now()
    console.debug(`Inserted ${res} GO terms into database in ${end - start} ms`)
  }
}
