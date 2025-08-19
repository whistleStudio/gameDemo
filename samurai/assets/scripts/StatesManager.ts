import { Vec3, EventTarget } from "cc";

export const EventBus = new EventTarget();

export class StatesManager {
  private static _instance: StatesManager | null = null;

  public playerPos: Vec3 = new Vec3();
  public isBlocked: Boolean = false;
  public playerMoveDir: Vec3 = new Vec3();
  private _playerHp: number = 1;


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
    EventBus.emit("playerHpChanged", value);
  }

  private constructor() {
    // Initialize your state manager here
  }
}