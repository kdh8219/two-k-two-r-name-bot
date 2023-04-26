import Client from "mojang-api-js";
import TwoWayMmap from "../utils/two-way-map.js";

class MojangAPI {
  private mojangAPI: Client = new Client();
  private cached: TwoWayMmap<string, string> = new TwoWayMmap<string, string>(); // uuid, id

  async getIdFromUUID(minecraft_uuid: string): Promise<string> {
    let id = this.cached.get_by_first(minecraft_uuid);
    if (id) return id;

    let mcid = await this.mojangAPI.uuidToName(minecraft_uuid);
    id = mcid.id;

    if (!id) throw new Error("Failed to get minecraft id from api");

    this.cached.set_by_first(minecraft_uuid, id);
    return id;
  }
  async getUUIDFromId(minecraft_id): Promise<string> {
    let uuid = this.cached.get_by_second(minecraft_id);
    if (uuid) return uuid;

    let mcid = await this.mojangAPI.nameToUuid(minecraft_id);
    uuid = mcid.id;
    if (!uuid) throw new Error("Failed to get minecraft id from api");

    this.cached.remove_by_first(uuid);
    this.cached.set_by_second(uuid, minecraft_id);
    return uuid;
  }
}
const mojangAPI = new MojangAPI();
export default mojangAPI;
