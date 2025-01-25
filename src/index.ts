import Aedes from "aedes";
import {createServer} from "node:tls";
import {env} from "./env";
import fs from "node:fs";
import {MQTT_USERNAME} from "./constants/constants";
import {AuthenticateError} from "./errors/AuthenticateError";
import {postReading} from "./modules/requests/postReading";

const aedes = new Aedes();
const server = createServer({
    cert: fs.readFileSync(env.SSL_CERT_PATH),
    key: fs.readFileSync(env.SSL_KEY_PATH),
}, aedes.handle);

const clients: Record<string, string> = {};

aedes.authenticate = (client, username, password, callback) => {
    if(username !== MQTT_USERNAME || !password) return callback(new AuthenticateError(4), null);
    callback(null, true);
    clients[client.id] = Buffer.from(password).toString('base64');
}

aedes.authorizePublish = async (client, packet, callback) => {
    if (packet.topic.startsWith('$SYS')) {
        return callback(new Error('Sys is reserved'))
    }

    if(!client || !clients[client.id]) {
        return callback(new Error('No token on file for publishing client'));
    }

    try {
        await postReading(
            packet.topic,
            clients[client.id],
            JSON.parse(
                Buffer.isBuffer(packet.payload) ?
                    Buffer.from(packet.payload).toString('base64') :
                    packet.payload
            )
        );
        callback(null);
    } catch (e) {
        console.error('error sending reading', e);
        callback(e as Error);
    }
}

server.listen(Number(env.PORT), () => {
    console.log(`Server listening on port ${env.PORT}`);
});