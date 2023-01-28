import { readConfigFile } from "./io";
import { z } from "zod";

const CONFIG_SCHEMA = z
    .object({
        bot: z
            .object({
                application_id: z.string(),
                token: z.string(),
            })
            .strict(),
        discord: z
            .object({
                guild_id: z.string(),
                channels: z.array(z.string()),
            })
            .strict(),
        out: z
            .object({
                outFileDir: z.ostring(),
                outFile: z.ostring(),
            })
            .strict(),
    })
    .strict();

export const config = CONFIG_SCHEMA.parse(await readConfigFile());
