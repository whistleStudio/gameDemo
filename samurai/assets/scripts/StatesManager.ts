import { Vec3, EventTarget, view, Size } from "cc";



export class StatesManager {
  private static _instance: StatesManager | null = null;

  public playerPos: Vec3 = new Vec3();
  public isBlocked: Boolean = false;
  public playerMoveDir: Vec3 = new Vec3();
  private _playerHp: number = 1;
  private _visibleSize: Size = view.getVisibleSize();


  public static get instance(): StatesManager {
    if (!StatesManager._instance) {
      StatesManager._instance = new StatesManager();
    }
    return StatesManager._instance;
  }

  public get playerHp(): number {
    return this._playerHp;
  }

  public set playerHp(value: number) {
    this._playerHp = value;
    EventBus.emit("playerHpChanged", {hp: value});
  }

  public get visibleSize(): Size {
    return this._visibleSize;
  }

  private constructor() {
    // 单例初始化时创建监听
    view.on("design-resolution-changed", (width: number, height: number) => {
      this._visibleSize = new Size(width, height);
    })
  }
}

interface EventMap {
  playerHpChanged: { hp: number };
  cameraShake: { dur: number; magnitude: number };
  freezeFrame: { dur: number };

}

class TypedEventBus {
  private bus = new EventTarget();
  // 监听事件
  on<K extends keyof EventMap>(event: K, callback: (arg: EventMap[K]) => void, thisArg: any) {
    this.bus.on(event, callback, thisArg);
  }
  // 发射事件
  emit<K extends keyof EventMap>(event: K, arg: EventMap[K]) {
    this.bus.emit(event, arg);
  }
  // 可选：移除监听
  off<K extends keyof EventMap>(event: K, callback: (arg: EventMap[K]) => void, thisArg: any) {
    this.bus.off(event, callback, thisArg);
  }
}

export const EventBus = new TypedEventBus();