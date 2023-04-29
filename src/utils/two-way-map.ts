/**
 * 양방향 map
 * 각 인자는 유일해야 합니다
 * ex) 마인크래프트 계정의 아이디-uuid
 */
export default class TwoWayMap<T1, T2> {
  private firstMap: Map<T1, T2> = new Map();
  private secondMap: Map<T2, T1> = new Map();
  get_by_first(getter: T1): T2 | undefined {
    return this.firstMap.get(getter);
  }
  get_by_second(getter: T2): T1 | undefined {
    return this.secondMap.get(getter);
  }
  set_by_first(first: T1, second: T2) {
    const secondGet = this.secondMap.get(second);
    if (secondGet) {
      throw new Error("Duplicate second argument");
    }
    this.firstMap.set(first, second);
    this.secondMap.set(second, first);
  }
  set_by_second(first: T1, second: T2) {
    const firstGet = this.firstMap.get(first);
    if (firstGet) {
      throw new Error("Duplicate first argument");
    }
    this.firstMap.set(first, second);
    this.secondMap.set(second, first);
  }
  remove_by_first(first: T1): T2 | undefined {
    const t2 = this.firstMap.get(first);
    if (!t2) return undefined;

    this.firstMap.delete(first);
    this.secondMap.delete(t2);
    return t2;
  }
  remove_by_second(second: T2): T1 | undefined {
    const t1 = this.secondMap.get(second);
    if (!t1) return undefined;

    this.firstMap.delete(t1);
    this.secondMap.delete(second);
    return t1;
  }
}
