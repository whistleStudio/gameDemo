import { _decorator, animation, Component, instantiate, Node, Prefab } from "cc";
const { ccclass, property } = _decorator;
import { EventBus, StatesManager } from "./StatesManager";

@ccclass("roleLayerControl")
export class roleLayerControl extends Component {
  @property(Prefab)
  enemyWolf: Prefab = null;

  protected onLoad(): void {
    EventBus.on("freezeFrame", this.onFreezFrame, this);
  }

  start() {
    const areaWidth = StatesManager.instance.moveAreaLimit.right - StatesManager.instance.moveAreaLimit.left;
    const areaHeight = StatesManager.instance.moveAreaLimit.top - StatesManager.instance.moveAreaLimit.bottom;  
    // 创建敌人
    for (let v of Array(StatesManager.instance.enemyCount)) {
      const enemy = instantiate(this.enemyWolf);
      enemy.setPosition(Math.random() * (areaWidth / 2), Math.random() * areaHeight + StatesManager.instance.moveAreaLimit.bottom, 0); // 中线右，出生点位横向离玩家一定距离
      this.node.addChild(enemy);
    }
  }

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
