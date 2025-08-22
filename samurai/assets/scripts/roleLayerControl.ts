import { _decorator, animation, Component, Node } from "cc";
const { ccclass, property } = _decorator;
import { EventBus } from "./StatesManager";

@ccclass("roleLayerControl")
export class roleLayerControl extends Component {
  protected onLoad(): void {
    EventBus.on("freezeFrame", this.onFreezFrame, this);
  }

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

  onFreezFrame({dur = 0.2} = {}) {
    const children = this.node.children;
    for (let v of children) {
      const animController = v.getComponent(animation.AnimationController);
      if (!animController) continue;
      animController.setValue("speedMul", 0); // 关键帧定格
      animController.scheduleOnce(() => {
        animController.setValue("speedMul", 1);
      }, dur);
    }
  }
}
