import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("roleLayerControl")
export class roleLayerControl extends Component {
  start() {}

  update(deltaTime: number) {
    /* 角色近远景层级动态切换 */
    const children = this.node.children;
    // 按y轴降序排列， y越大越远
    children.sort((a, b) => {
      return b.position.y - a.position.y;
    });
    // 更新层叠关系
    for (let i = 0; i < children.length; i++) {
      children[i].setSiblingIndex(i);
    }
  }
}
