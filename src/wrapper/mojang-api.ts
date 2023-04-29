import axios from "axios";

import TwoWayMap from "../utils/two-way-map.js";

class MojangAPI {
  private cached: TwoWayMap<string, string> = new TwoWayMap<string, string>(); // uuid, id

  async getIdFromUUID(minecraft_uuid: string): Promise<string> {
    let id = this.cached.get_by_first(minecraft_uuid);
    if (id) return id;

    const request = await axios.get(
      `https://api.mojang.com/user/profile/${minecraft_uuid}`
    );
    id = request.data.name;

    if (!id) throw new Error("Failed to get minecraft id from api");

    this.cached.set_by_first(minecraft_uuid, id);
    return id;
  }
  async getUUIDFromId(minecraft_id): Promise<string> {
    let uuid = this.cached.get_by_second(minecraft_id);
    if (uuid) return uuid;

    const response = await axios.get(
      `https://api.mojang.com/users/profiles/minecraft/${minecraft_id}`
    );
    uuid = response.data.id;
    if (!uuid) throw new Error("Failed to get minecraft id from api");

    this.cached.remove_by_first(uuid);
    this.cached.set_by_second(uuid, minecraft_id);
    return uuid;
  }
}
const mojangAPI = new MojangAPI();
export default mojangAPI;
