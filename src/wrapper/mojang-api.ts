import axios from "axios";

import TwoWayMap from "../utils/two-way-map.js";
import firebase from "./firebase.js";

type TCacheData = {
  uuid: string;
  id: string;
};

export class MojangAPI {
  private cache: TwoWayMap<string, string> = new TwoWayMap<string, string>(); // uuid, id
  private firestore = firebase.collection("uuidMap");

  async getIdFromUUID(minecraft_uuid: string): Promise<string> {
    let id = this.cache.get_by_first(minecraft_uuid);
    if (id) return id;

    const request = await axios.get(
      `https://api.mojang.com/user/profile/${minecraft_uuid}`
    );
    id = request.data.name;
    if (!id) throw new Error("Failed to get minecraft id from api");

    const get_by_id = await this.firestore.where("id", "==", id).get();
    get_by_id.forEach((doc) => doc.ref.delete());
    await this.firestore.add({ uuid: minecraft_uuid, id: id });

    this.cache.remove_by_second(id);
    this.cache.set_by_first(minecraft_uuid, id);

    return id;
  }
  async getUUIDFromId(minecraft_id: string): Promise<string> {
    let uuid = this.cache.get_by_second(minecraft_id);
    if (uuid) return uuid;

    const response = await axios.get(
      `https://api.mojang.com/users/profiles/minecraft/${minecraft_id}`
    );
    uuid = response.data.id;
    if (!uuid) throw new Error("Failed to get minecraft id from api");

    const get_by_uuid = await this.firestore.where("uuid", "==", uuid).get();
    get_by_uuid.forEach((doc) => doc.ref.delete());
    await this.firestore.add({ uuid: uuid, id: minecraft_id });

    this.cache.remove_by_first(uuid);
    this.cache.set_by_second(uuid, minecraft_id);

    return uuid;
  }
  async load_cache_from_firestore() {
    const uuidMap = this.firestore;
    (await uuidMap.get()).forEach((item) => {
      const data = item.data() as TCacheData;
      this.cache.set_by_first(data.uuid, data.id);
    });
  }
  get_id_from_uuid_only_cache(minecraft_uuid: string) {
    return this.cache.get_by_first(minecraft_uuid);
  }
}
const mojangAPI = new MojangAPI();
export default mojangAPI;
