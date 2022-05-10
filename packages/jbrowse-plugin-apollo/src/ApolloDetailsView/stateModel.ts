import PluginManager from '@jbrowse/core/PluginManager'
import { getContainingView, getSession } from '@jbrowse/core/util'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { AnnotationFeatureI, ChangeManager } from 'apollo-shared'
import { Instance, getParent, types } from 'mobx-state-tree'

export function stateModelFactory(pluginManager: PluginManager) {
  return types
    .model('ApolloDetailsView', {
      id: ElementId,
      type: types.literal('ApolloDetailsView'),
    })
    .views((self) => ({
      get selectedFeature(): AnnotationFeatureI | undefined {
        return getParent(self).selectedFeature
      },
      get setSelectedFeature() {
        return getParent(self).setSelectedFeature
      },
      getAssemblyId(assemblyName: string) {
        const { assemblyManager } = getSession(self)
        const assembly = assemblyManager.get(assemblyName)
        if (!assembly) {
          throw new Error(`Could not find assembly named ${assemblyName}`)
        }
        return assembly.name
      },
      get changeManager() {
        const apolloView = getContainingView(self)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (apolloView as any).dataStore?.changeManager as
          | ChangeManager
          | undefined
      },
    }))
}

export type ApolloDetailsViewStateModel = ReturnType<typeof stateModelFactory>
export type ApolloDetailsViewModel = Instance<ApolloDetailsViewStateModel>