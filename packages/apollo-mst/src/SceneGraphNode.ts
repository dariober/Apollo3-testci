import {
  IAnyModelType,
  Instance,
  SnapshotOrInstance,
  getParentOfType,
  types,
} from 'mobx-state-tree'

export const LateSceneGraphNode = types.late(
  (): IAnyModelType => SceneGraphNode,
)

const SceneGraphNode = types
  .model({
    relX: 0,
    relY: 0,
    children: types.array(LateSceneGraphNode),
  })
  .views((self) => ({
    get parent(): Instance<typeof LateSceneGraphNode> | undefined {
      try {
        return getParentOfType(self, SceneGraphNode)
      } catch (e) {
        return undefined
      }
    },
  }))
  .views((self) => ({
    get sceneGraphRoot() {
      let parent = self
      while (parent.parent) {
        ;({ parent } = self)
      }
      return parent
    },
  }))
  .views((self) => ({
    get x() {
      const { parent } = self
      if (parent) {
        return parent.x + self.relX
      }
      return self.relX
    },
    get y() {
      const { parent } = self
      if (parent) {
        return parent.y + self.relY
      }
      return self.relY
    },
  }))
  .actions((self) => ({
    addChild(child: SnapshotOrInstance<typeof LateSceneGraphNode>) {
      self.children.push(child)
    },
  }))

export default SceneGraphNode
